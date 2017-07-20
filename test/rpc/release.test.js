/**
 * pas.ReleaseClient() tests.
 *
 * @copyright Realeyes OU. All rights reserved.
 */


import chai, {expect} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);


describe('pas.ReleaseClient() method', () => {
    let serverFrame, client, server;

    beforeEach(done => {
        serverFrame = document.createElement('iframe');
        document.body.appendChild(serverFrame);
        serverFrame.src = '/base/test/rpc/server-frame.html';
        serverFrame.onload = () => {
            server = serverFrame.contentWindow.api;
            pas.CreateClientAsync(window, serverFrame.contentWindow).then((c) => {
                client = c;
                done();
            });
        };
    });

    afterEach(() => {
        document.body.removeChild(serverFrame);
    });

    it('should be a function', () => {
        expect(pas.ReleaseClient).to.be.a('function');
        //cleanup
        pas.ReleaseClient(client);
    });


    it('should clean up the "message" event listeners for the client', () => {
        const spy = sinon.spy();
        return client.foo().then((res) => {
            expect(res).to.equal('bar');
            return pas.ReleaseClient(client).then(() => {
                client.foo().then(spy);
                expect(spy).to.not.have.been.called;
            });
        });
    });

    it('should unsubscribe the client of all subscribed events', () => {
        const spy = sinon.spy();

        return client.on('event', spy)
            .then(() => {
                expect(server.listenerCount('event')).to.equal(1);
                return pas.ReleaseClient(client).then(() => {
                    expect(server.listenerCount('event')).to.equal(0);
                });
            });
    });

    it('should unsubscribe the client of all subscribed events but not touch others\' subscriptions', () => {
        const spy = sinon.spy();

        server.on('event', () => {}); // create subscription directly not via the client
        return client.on('event', spy)
            .then(() => {
                expect(server.listenerCount('event')).to.equal(2);
            })
            .then(() => {
                return pas.ReleaseClient(client)
                    .then(() => {
                        expect(server.listenerCount('event')).to.equal(1);
                    });
            });
    });
});
