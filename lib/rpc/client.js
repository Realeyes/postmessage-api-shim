/**
 * PostMessage client.
 *
 * @copyright Realeyes OU. All rights reserved.
 */


import {EventEmitter} from 'events';
import uid from '../utils/uid';


const MESSAGE_TYPE_RESPONSE = 'response';
const MESSAGE_TYPE_EVENT = 'event';
const MESSAGE_TYPE_ERROR = 'error';


const _calls = Symbol('calls');


/**
 * Creates client api instance.
 * 
 * @param {Window} clientWindow
 * @param {Window} serverWindow
 * @return {Proxy}
 */
export default function (clientWindow, serverWindow) {
    const client = Object.assign(new EventEmitter(), {
        [_calls]: {},

        registerCall(resolve, reject) {
            const id = uid();
            this[_calls][id] = { resolve, reject };

            return id;
        },

        processMessage({id, payload = [], type}) {
            switch (type) {
                case MESSAGE_TYPE_RESPONSE:
                    this[_calls][id].resolve(...payload);
                    break;
                case MESSAGE_TYPE_ERROR:
                    this[_calls][id].reject(...payload);
                    break;
                case MESSAGE_TYPE_EVENT:
                    this.emit(payload.name, ...payload.args);
                    break;
                default:
                    throw new Error('unknown message type');
            }

            if (id) {
                delete this[_calls][id];
            }
        }
    });

    clientWindow.addEventListener('message', ({ data }) => client.processMessage(data));

    return new Proxy(client, {
        get(client, method) {
            return (...args) => new Promise((resolve, reject) => {
                // check if we are subscribing or unsubscribing from an event
                if (['on', 'off'].indexOf(method) !== -1) {
                    // use EventEmitter interface to subscribe/unsubscribe
                    client[method](...args);
                    // leave only the name of the event in arguments list, since we can not
                    // and should not pass the handler function to the server window
                    args.splice(1);
                }

                // register and execute the remote procedure call
                const id = client.registerCall(resolve, reject);
                serverWindow.postMessage({ id, method, args }, '*');
            });
        }
    });
}
