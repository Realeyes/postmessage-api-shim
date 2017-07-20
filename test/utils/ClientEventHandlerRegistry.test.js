/**
 * Created by laszlo.vass on 7/19/2017.
 */
import chai, {expect} from 'chai';
import ClientEventHandlerRegistry from "../../lib/utils/ClientEventHandlerRegistry";

describe('ClientEventHandlerRegistry should add', () => {
    let _registry;

    beforeEach(done => {
        _registry = new ClientEventHandlerRegistry();
        done();
    });

    it('a handler to an event', () => {
        const client = { id: 1 };
        _registry.add(client, 'event', () => {});
        expect(_registry.get(client).length).to.equal(1);
        expect(_registry.get(client, 'event').length).to.equal(1);
    });

    it('more handlers to the same event', () => {
        const client = { id: 1 };
        _registry.add(client, 'event', () => {});
        _registry.add(client, 'event', () => {});
        expect(_registry.get(client).length).to.equal(2);
        expect(_registry.get(client, 'event').length).to.equal(2);
    });

    it('handlers to more than one event', () => {
        const client = { id: 1 };
        _registry.add(client, 'event', () => {});
        _registry.add(client, 'event2', () => {});
        expect(_registry.get(client).length).to.equal(2);
        expect(_registry.get(client, 'event').length).to.equal(1);
        expect(_registry.get(client, 'event2').length).to.equal(1);
    });

    it('handlers to more than one client', () => {
        const client = { id: 1 };
        const client2 = { id: 2 };
        _registry.add(client, 'event', () => {});
        _registry.add(client2, 'event', () => {});
        expect(_registry.get(client).length).to.equal(1);
        expect(_registry.get(client2).length).to.equal(1);
        expect(_registry.get(client, 'event').length).to.equal(1);
        expect(_registry.get(client2, 'event').length).to.equal(1);
    });
});

describe('ClientEventHandlerRegistry should delete', () => {
    let _registry, client, client2;

    beforeEach(done => {
        _registry = new ClientEventHandlerRegistry();
        client = { id: 1 };
        client2 = { id: 2 };
        _registry.add(client, 'event', () => {});
        _registry.add(client, 'event', () => {});
        _registry.add(client, 'event2', () => {});
        _registry.add(client2, 'event', () => {});
        done();
    });

    it('all handlers of a client for a specific event', () => {
        expect(_registry.get(client).length).to.equal(3);
        _registry.delete(client, 'event');
        expect(_registry.get(client).length).to.equal(1);
    });

    it('all handlers of a client', () => {
        expect(_registry.get(client).length).to.equal(3);
        _registry.delete(client);
        expect(_registry.get(client).length).to.equal(0);
        expect(_registry.get(client2).length).to.equal(1);
    });
});
