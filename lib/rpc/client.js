/**
 * PostMessage client.
 *
 * @copyright Realeyes OU. All rights reserved.
 */


import {EventEmitter} from 'events';
import uid from '../utils/uid';


/**
 * Message types.
 */
const MESSAGE_TYPE_RESPONSE = 'response';
const MESSAGE_TYPE_EVENT = 'event';
const MESSAGE_TYPE_ERROR = 'error';


/**
 * Symbol for private calls property of client object.
 *
 * @type {Symbol}
 * @private
 */
const _calls = Symbol('calls');


/**
 * Creates client api instance.
 *
 * @param {Window} clientWindow
 * @param {Window} serverWindow
 * @return {Proxy}
 */
export default function (clientWindow, serverWindow) {
    // create a client object
    const client = Object.assign(new EventEmitter(), {
        /**
         * Map of registered calls.
         *
         * @private
         */
        [_calls]: {},


        /**
         * Registers RPC calls by creating a unique id and saving
         * resolve/reject handlers in a  map.
         * Returns an id of the registered call.
         *
         * @param {function(*)} resolve
         * @param {function(*)} reject
         * @return {number}
         */
        registerCall(resolve, reject) {
            const id = uid();
            this[_calls][id] = { resolve, reject };

            return id;
        },


        /**
         * Handles the window "message" event. If the message is a
         * successful or error response calls the corresponding handler
         * and deletes the registered call from the map.
         *
         * If the message is an event - emits an event.
         *
         * @param {number} id
         * @param {Array.<*>|{name:string,args:Array.<*>}} payload
         * @param {string} type
         */
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

    // set handler for the window message
    clientWindow.addEventListener('message', ({ data }) => client.processMessage(data));

    /**
     * Return Proxy wrapper for the API. Intercepts the property access and returns a function
     * that registers a corresponding API call and returns a Promise for that call.
     */
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
