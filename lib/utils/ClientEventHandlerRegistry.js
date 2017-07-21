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
        if(eventName) {
            for(let i=0;i<this._registry.length;i++) {
                if(this._registry[i] && this._registry[i].client === client && this._registry[i].eventName === eventName) {
                    delete this._registry[i];
                }
            };
        }
        else {
            for(let i=0;i<this._registry.length;i++) {
                if(this._registry[i] && this._registry[i].client === client) {
                    delete this._registry[i];
                }
            };
        }
    }
}

class ClientEventHandler {
    constructor(client, eventName, handler) {
        this.client = client;
        this.eventName = eventName;
        this.handler = handler;
    }
}