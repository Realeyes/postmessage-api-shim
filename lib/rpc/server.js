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
 */
export default function (serverWindow, api) {
    serverWindow.addEventListener('message', ({ data: { id, method, args = [] }, source }) => {
        // call to nonexistent method returns a TypeError
        if (typeof api[method] !== 'function') {
            return post(source, id, message.MESSAGE_TYPE_ERROR, new TypeError(`Method ${method} not found`));
        }

        // handle event subscription
        if (method === 'on') {
            const name = args[0];
            api.on(name, (...args) => {
                post(source, null, message.MESSAGE_TYPE_EVENT, { name, args });
            });

            return post(source, id, message.MESSAGE_TYPE_RESPONSE);
        }

        // handle event unsubscription
        if (method === 'off') {
            api.off(args[0]);

            return post(source, id, message.MESSAGE_TYPE_RESPONSE);
        }

        // call api method and post to client window on promise resolution/rejection
        api[method](...args).then((...args) => post(source, id, message.MESSAGE_TYPE_RESPONSE, args),
                                  (...args) => post(source, id, message.MESSAGE_TYPE_ERROR, args));
    });
};
