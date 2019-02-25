/**
 * RPC tests.
 *
 * @copyright Realeyes OU. All rights reserved.
 */


const Promise = require('es6-promise-polyfill').Promise;
import chai, {
	expect
} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

[true,false].forEach((param) => {
	describe('RPC integration', ((addSourceToApiCall) => {
		return () => {
			let serverFrame, client, server;

			beforeEach(done => {
				serverFrame = document.createElement('iframe');
				document.body.appendChild(serverFrame);
				serverFrame.src = `/base/test/rpc/server-frame.html?addSourceToApiCall=${addSourceToApiCall}`;
				serverFrame.onload = () => {
					server = serverFrame.contentWindow.api;
					pas.CreateClientAsync(window, serverFrame.contentWindow).then((c) => {
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

				it('should resolve a call to inherited method with the result of the call', done => {
					client.inherited().then(res => {
						expect(res).to.not.be.null;
						done();
					});
				});

				it(`should ${addSourceToApiCall ? '' : 'not'} first parameter be window`, (done) => {
					client.getAddSourceToApiCallParam().then(res => {
					    expect(res).to.equal(addSourceToApiCall);
                        client.hasSourceWindowAsFirstParameter().then(res => {
                            expect(res).to.equal(addSourceToApiCall);
                            done();
                        }).catch(e => done(e));
					}).catch(e => done(e)) ;
				})
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
							let listenerCount = server.listenerCount('event');
							server.emit('event', 'event-payload');
							setTimeout(() => {
								expect(spy).to.have.been.calledWith('event-payload');

								client.off('event')
									.then(() => {
										expect(server.listenerCount('event')).to.equal(listenerCount - 1);
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
		}
	})(param));
});