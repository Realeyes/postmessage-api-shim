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
        pas.ReleaseClient(client);
    });


    it('should clean up the "message" event listeners for the client', done => {
        const spy = sinon.spy();
        client.foo().then((res) => {
            expect(res).to.equal('bar');
            pas.ReleaseClient(client);
            client.foo().then(spy);
            setTimeout(() => {
                expect(spy).to.not.have.been.called;
                done();
            }, 100);
        });
    });

    it('should unsubscribe the client of all subscribed events', done => {
        const spy = sinon.spy();

        client.on('event', spy)
            .then(() => {
                expect(server.listenerCount('event')).to.equal(1);
                pas.ReleaseClient(client).then(() => {
                    setTimeout(() => {
                        expect(server.listenerCount('event')).to.equal(0);
                        done();
                    }, 100);
                });
            });
    });

    it('should unsubscribe the client of all subscribed events but not touch others\' subscriptions', (done) => {
        const spy = sinon.spy();

        server.on('event', () => {}); // create subscription directly not via the client
        client.on('event', spy)
            .then(() => {
                try {
                    expect(server.listenerCount('event')).to.equal(2);
                }
                catch (e) {
                    throw e;
                }
                pas.ReleaseClient(client).then(() => {
                    setTimeout(() => {
                        try {
                            expect(server.listenerCount('event')).to.equal(1);
                        }
                        catch(e) {
                            throw e;
                        }
                        done();
                    }, 100);
                });
            });
    });
});
