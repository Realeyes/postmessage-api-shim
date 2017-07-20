/**
 * Created by laszlo.vass on 7/20/2017.
 */


import chai, {expect} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);


describe('In a cross-domain environment', () => {
    let serverFrame, client;

    beforeEach(done => {
        serverFrame = document.createElement('iframe');
        document.body.appendChild(serverFrame);
        serverFrame.src = 'http://localhost:9876/base/test/rpc/server-frame.html';
        serverFrame.addEventListener('load', () => {
            setTimeout(() => { // in IE there is a timing issue without setTimeout....
                pas.CreateClientAsync(window, serverFrame.contentWindow).then((c) => {
                    client = c;
                    done();
                });
            }, 1000);
        });
    });

    afterEach(done => {
        pas.ReleaseClient(client);
        document.body.removeChild(serverFrame);
        done();
    });

    it('the server iframe should be loaded from a different domain', () => {
        expect(serverFrame.src.indexOf('http://localhost:9876/')).to.equal(0);
    });

    it('client should be able to call server method', () => {
        client.foo().then(result => {
            expect(result).to.equal('bar');
        });
    });

    it('client should be able to subscribe to an event', () => {
        const spy = sinon.spy();
        client.on('event', spy);
        return client.emitEvent('event')
            .then(() => {
                expect(spy).to.have.been.calledOnce;
            })
            .catch(e => {
                throw new Error(e);
            });
    });
})
