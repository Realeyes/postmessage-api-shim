/**
 * Structure: {
 *      client: {
 *          eventName: [
 *              handler,
 *              handler,
 *              ...
 *          ]
 *      }
 * }
 */
import WeakMap from 'weakmap';

export default class {
    constructor() {
        this._registry = new WeakMap();
    }
    add(client, eventName, handler) {
        let events = this._registry.get(client) || {};
        let handlers = events[eventName] || [];
        handlers.push(handler);
        events[eventName] = handlers;
        this._registry.set(client, events);
    }

    get(client, eventName=null) {
        let events = this._registry.get(client) || {};
        if(eventName) {
            return events[eventName] || [];
        }
        return this._registry.get(client) || {};
    }

    delete(client, eventName=null) {
        let events = this._registry.get(client) || {};
        if(eventName) {
            if(events[eventName]) {
                delete events[eventName];
                this._registry.set(client, events);
            }
        }
        else {
            this._registry.delete(client);
        }
    }
}