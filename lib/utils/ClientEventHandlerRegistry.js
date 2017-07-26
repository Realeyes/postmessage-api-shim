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
export default class {
    constructor() {
        this._registry = [];
    }
    add(client, eventName, handler) {
        this._registry.push(new ClientEventHandler(client, eventName, handler));
    }

    get(client, eventName=null) {
        let events = this._registry.filter(i => i.client === client);
        if(eventName) {
            return events.filter(i => i.eventName === eventName);
        }
        return events;
    }

    delete(client, eventName=null) {
        Object.keys(this._registry).forEach(i => {
            if(this._registry[i].client === client && (eventName === null || this._registry[i].eventName === eventName)) {
                delete this._registry[i];
            }
        });
    }
}

class ClientEventHandler {
    constructor(client, eventName, handler) {
        this.client = client;
        this.eventName = eventName;
        this.handler = handler;
    }
}