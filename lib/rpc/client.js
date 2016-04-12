/**
 * PostMessage client.
 *
 * @copyright Realeyes OU. All rights reserved.
 */


import {EventEmitter} from 'events';
import uid from '../utils/uid';
import * as message from './message';


/**
 * Creates client api instance.
 *
 * @param {Window} clientWindow
 * @param {Window} serverWindow
 * @param {string} token
 * @return {Proxy}
 */
export default function (clientWindow, serverWindow, token) {
    // create a client object
    const client = Object.assign(new EventEmitter(), {
        /**
         * Map of registered calls.
         *
         * @private
         */
        _calls: {},


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
            this._calls[id] = { resolve, reject };

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
         * @param {string} _token
         */
        processMessage({id, payload = [], type, _token}) {
            // ignore messages without token
            if (_token !== token) {
                return;
            }

            switch (type) {
                case message.MESSAGE_TYPE_RESPONSE:
                    this._calls[id].resolve(...payload);
                    break;
                case message.MESSAGE_TYPE_ERROR:
                    this._calls[id].reject(...payload);
                    break;
                case message.MESSAGE_TYPE_EVENT:
                    this.emit(payload.name, ...payload.args);
                    break;
                default:
                    throw new Error('unknown message type');
            }

            if (id) {
                delete this._calls[id];
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
                serverWindow.postMessage({ id, method, args, _token: token }, '*');
            });
        }
    });
}
