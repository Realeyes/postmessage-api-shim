/**
 * RPC tests.
 *
 * @copyright Realeyes OU. All rights reserved.
 */


const Promise = require('es6-promise-polyfill').Promise;
import chai, {expect} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);


describe('RPC integration', () => {
    let serverFrame, client, server;


    beforeEach(done => {
        serverFrame = document.createElement('iframe');
        document.body.appendChild(serverFrame);
        serverFrame.src = '/base/test/rpc/server-frame.html';
        serverFrame.onload = () => {
            server = serverFrame.contentWindow.api;
            pas.CreateClient(window, serverFrame.contentWindow).then((c) => {
                client = c;
                done();
            });
        };
    });


    afterEach(() => {
        pas.ReleaseClient(client);
        document.body.removeChild(serverFrame);
    });


    describe('call', () => {
        it('should return a Promise', () => {
            // expect(client.foo()).to.be.an.instanceOf(Promise);
            expect(client.foo().then).to.exists;
        });


        it('should throw exception on a call to nonexistent method', done => {
            expect(() => client.nonexistent()).to.throw();
            done();
        });


        it('should resolve a call to existing method with the result of the call', done => {
            client.foo().then(res => {
                expect(res).to.equal('bar');
                done();
            });
        });
    });


    describe('event', () => {
        it('should be possible to subscribe to event', done => {
            client.on('event', payload => {
                expect(payload).to.equal('event-payload');
                client.off('event');
                done();
            }).then(() => server.emit('event', 'event-payload'));
        });


        it('should be possible to unsubscribe from event', done => {
            const spy = sinon.spy();

            client.on('event', spy)
                .then(() => {
                    server.emit('event', 'event-payload');
                    setTimeout(() => {
                        expect(spy).to.have.been.calledWith('event-payload');

                        client.off('event')
                            .then(() => {
                                server.emit('event', 'event-payload');
                                setTimeout(() => {
                                    expect(spy).to.have.been.calledOnce;

                                    done();
                                }, 100);
                            });
                    }, 100);
                });
        });
    });
});
