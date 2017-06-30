/**
 * PostMessage server.
 *
 * @copyright Realeyes OU. All rights reserved.
 */


import post from '../utils/post';
import * as message from './message';


/**
 * Creates RPC server instance.
 *
 * @param {Window} serverWindow
 * @param {{on:function(string, ...*), off:function(string, ...*)}|*} api
 * @param {string} token
 */
export function CreateServer(serverWindow, api, token = 'defaultToken') {
    serverWindow.addEventListener('message', ({ data: { id, method, args = [], _token }, source }) => {
        // ignore messages that are not sent from the client that was created with the same token
        if (_token !== token) {
            return;
        }

        if(method === '_getAvailableMethods') {
            let serverMethods = [];
            let o = api;
            while(o !== null) {
                Object.keys(o).forEach((k) => {
                   if(typeof o[k] === 'function') {
                       serverMethods.push(k);
                   }
                });
                o = o.__proto__;
            }

            return post(source, null, message.MESSAGE_TYPE_RESPONSE, serverMethods, token);
        }

        // call to nonexistent method returns an error
        if (typeof api[method] !== 'function') {
            return post(source, id, message.MESSAGE_TYPE_ERROR, [`Method ${method} not found`], token);
        }

        // handle event subscription
        if (method === 'on') {
            const name = args[0];
            api.on(name, (...args) => {
                post(source, null, message.MESSAGE_TYPE_EVENT, { name, args }, token);
            });

            return post(source, id, message.MESSAGE_TYPE_RESPONSE, [true], token);
        }

        // handle event unsubscription
        if (method === 'off') {
            api.off(args[0]);

            return post(source, id, message.MESSAGE_TYPE_RESPONSE, [true], token);
        }

        // call api method and post to client window on promise resolution/rejection
        api[method](...args).then((...args) => post(source, id, message.MESSAGE_TYPE_RESPONSE, args, token),
                                  (...args) => post(source, id, message.MESSAGE_TYPE_ERROR, args, token));
    });
};
