/**
 * PostMessage server.
 *
 * @copyright Realeyes OU. All rights reserved.
 */


import post from '../utils/post';
import * as message from './message';
import ClientEventHandlerRegistry from "../utils/ClientEventHandlerRegistry";


/**
 * Creates RPC server instance.
 *
 * @param {Window} serverWindow
 * @param {{on:function(string, ...*), off:function(string, ...*)}|*} api
 * @param {string} token
 */
export function CreateServer(serverWindow, api, token = 'defaultToken', addSourceToApiCall = false) {
    let clientEventHandlers = new ClientEventHandlerRegistry();

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
                o = Object.getPrototypeOf(o);
            }
            console.table(serverMethods);

            return post(source, null, message.MESSAGE_TYPE_RESPONSE, serverMethods, token);
        }

        // handle event subscription
        if (method === 'on') {
            console.warn(`on ${token}`)
            const name = args[0];
            const handler = (...args) => {
                post(source, null, message.MESSAGE_TYPE_EVENT, { name, args }, token);
            };
            clientEventHandlers.add(source, name, handler);
            api.on(name, handler);

            return post(source, id, message.MESSAGE_TYPE_RESPONSE, [true], token);
        }

        // handle event unsubscription
        if (method === 'off') {
            console.warn(`off ${token}`)
            const eventName = args[0];
            if (eventName) { // remove all listener of the client for a specific event
                const handlers = clientEventHandlers.get(source, eventName);
                handlers.forEach(h => {
                    api.removeListener(h.eventName, h.handler);
                });
                clientEventHandlers.delete(source, eventName);
            }
            else { // remove all listener of the client
                const handlers = clientEventHandlers.get(source);
                handlers.forEach(h => {
                    api.removeListener(h.eventName, h.handler);
                })
                clientEventHandlers.delete(source);
            }
            return post(source, id, message.MESSAGE_TYPE_RESPONSE, [true], token);
        }

        // call to nonexistent method returns an error
        if (typeof api[method] !== 'function') {
            console.warn(`error ${method}`)
            return post(source, id, message.MESSAGE_TYPE_ERROR, [`Method ${method} not found`], token);
        }

        // call api method and post to client window on promise resolution/rejection
        if (addSourceToApiCall) {
            api[method](source,...args).then((...args) => post(source, id, message.MESSAGE_TYPE_RESPONSE, args, token),
            (...args) => post(source, id, message.MESSAGE_TYPE_ERROR, args, token));
        }
        else{
            api[method](...args).then((...args) => post(source, id, message.MESSAGE_TYPE_RESPONSE, args, token),
            (...args) => post(source, id, message.MESSAGE_TYPE_ERROR, args, token));
        }
    });
};
