/**
 * Created by laszlo.vass on 7/20/2017.
 */


import chai, {expect} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);


describe.only('In a cross-domain environment', () => {
    let serverFrame, client;

    beforeEach(done => {
        serverFrame = document.createElement('iframe');
        document.body.appendChild(serverFrame);
        serverFrame.src = 'http://localhost:8080/base/test/rpc/server-frame.html';
        serverFrame.onload = () => {
            pas.CreateClientAsync(window, serverFrame.contentWindow).then((c) => {
                client = c;
                done();
            });
        };
    });

    afterEach(done => {
        pas.ReleaseClient(client);
        document.body.removeChild(serverFrame);
        done();
    });

    it('the server iframe should be loaded from a different domain', () => {
        expect(serverFrame.src.indexOf('http://localhost:8080/')).to.equal(0);
    });

    it('client should be able to call server method', () => {
        client.foo().then(result => {
            expect(result).to.equal('bar');
        });
    });

    it('client should be able to subscribe to an event', () => {
        const spy = sinon.spy();
        client.on('event', spy);
        return client.emitEvent('event').then(() => {
            expect(spy).to.have.been.called();
        });
    });
})
