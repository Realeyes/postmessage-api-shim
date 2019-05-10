/**
 * PostMessage client.
 *
 * @copyright Realeyes OU. All rights reserved.
 */


import {EventEmitter} from 'events';
import uid from '../utils/uid';
import * as message from './message';


/**
 * Storage for client event handlers.
 *
 * @type {WeakMap}
 */
const clientHandlers = new WeakMap();


/**
 * Cleans up the client 'message' event listeners.
 *
 * @param client
 * @constructor
 */
export function ReleaseClient(client) {
    return new Promise((resolve) => {
        const data = clientHandlers.get(client);
        client.off().then(() => {
            data.clientWindow.removeEventListener('message', data.handler);
            resolve();
        });
    });
}


/**
 * Creates client api instance.
 *
 * @param {Window} clientWindow
 * @param {Window} serverWindow
 * @param {Array} methods - list of methods available at the server
 * @param {number} timeout - timeout in milliseconds after which the call will be rejected
 * @param {string} token
 * @return {Proxy}
 */
function _CreateClient(clientWindow, serverWindow, methods, timeout = 30000, token = 'defaultToken') {
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
         * @param {string} method
         * @return {number}
         */
        registerCall(resolve, reject, method) {
            const id = uid();
            const timeoutId = setTimeout(() => {
                if (typeof this._calls[id] !== 'undefined') {
                    delete this._calls[id];
                    reject(new Error(`Method ${method} with id ${id} timed out`));
                }
            }, timeout);
            this._calls[id] = { resolve, reject, timeoutId };

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
            // we should only process messages from the server that
            // was created with the same token
            if (_token !== token) {
                return;
            }

            // return if we don't have a record in the _calls cache
            // this can happen if the call timed out
            if (typeof this._calls[id] === 'undefined' && type === message.MESSAGE_TYPE_RESPONSE) {
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
                clearTimeout(this._calls[id].timeoutId);
                delete this._calls[id];
            }
        }
    });

    /**
     * Proxy wrapper for the API. Intercepts the property access and returns a function
     * that registers a corresponding API call and returns a Promise for that call.
     */
    const proxyMethod = (client, method) => {
        return (...args) => new Promise((resolve, reject) => {
            // check if we are subscribing or unsubscribing from an event
            if (['on', 'off'].indexOf(method) !== -1) {
                // comply with node.js EventEmitter interface
                let eeMethod;
                if (method === 'off') {
                    eeMethod = args.length > 1 ? 'removeListener' : 'removeAllListeners';
                } else {
                    eeMethod = '_on';
                }
                // use EventEmitter interface to subscribe/unsubscribe
                client[eeMethod](...args);
                // leave only the name of the event in arguments list, since we can not
                // and should not pass the handler function to the server window
                args.splice(1);
            }

            // register and execute the remote procedure call
            const id = client.registerCall(resolve, reject, method);
            serverWindow.postMessage({ id, method, args, _token: token }, '*');
        });
    };

    // create methods since proxy polyfill only works on properties that already exist at creation time
    methods.forEach((m) => {
        if(typeof client[m] === 'undefined') {
            client[m] = proxyMethod(client, m); //TODO: can we make it simpler?
        }
    })
    client._on = client.on;
    client.on = proxyMethod(client, 'on');
    client.off = proxyMethod(client, 'off');


    // set handler for the window message and store it in the WeakMap
    const handler = ({ data }) => client.processMessage(data);
    clientHandlers.set(client, { handler, clientWindow });
    clientWindow.addEventListener('message', handler);

    return client;
}
/**
 * get available methods from server then launch client creation
 * @param {Window} clientWindow
 * @param {Window} serverWindow
 * @param {number} timeout - timeout in milliseconds after which the call will be rejected
 * @param {string} token
 * @return {Promise}
 */
export function CreateClientAsync(clientWindow, serverWindow, timeout = 30000, token = 'defaultToken') {
    console.warn(
        `CLIENT:`
    );
    return new Promise( (resolve, reject) => {
        let handler = ({data}) => {
            if(data._token === token && data.id === null && data.payload && data.payload.constructor === Array) {
                const serverMethods = data.payload;
                clientWindow.removeEventListener('message', handler);
                resolve(_CreateClient(clientWindow, serverWindow, serverMethods, timeout, token));
            }
        };
        clientWindow.addEventListener('message', handler);
        serverWindow.postMessage({id: null, method: '_getAvailableMethods', _token: token}, '*');
    });
}

/**
 * obsolete method, will just throw an error to make api change obvious
 * @constructor
 */
export function CreateClient() {
    throw "CreateClient method was obsoleted, please use CreateClientAsync instead";
}
