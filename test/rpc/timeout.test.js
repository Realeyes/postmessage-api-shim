/**
 * RPC call timeout tests.
 *
 * @copyright Realeyes OU. All rights reserved.
 */


import chai, {expect} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);


describe('RPC call timeout', () => {
    let serverFrame, client;

    beforeEach(done => {
        serverFrame = document.createElement('iframe');
        document.body.appendChild(serverFrame);
        serverFrame.src = '/base/test/rpc/server-frame.html';
        serverFrame.onload = () => done();
    });

    afterEach(() => {
        pas.ReleaseClient(client);
        document.body.removeChild(serverFrame);
    });

    it('should not reject the call if the timeout does not exceed the limit', done => {
        const spy = sinon.spy();
        pas.CreateClientAsync(window, serverFrame.contentWindow, 250).then(c => {
            client = c;
            client.long().then(spy);
            setTimeout(() => {
                expect(spy).to.have.been.called;
                done();
            }, 350);
        });
    });

    it('should reject the call if the timeout exceeds the limit', done => {
        const spy = sinon.spy();
        const rejectSpy = sinon.spy();
        pas.CreateClientAsync(window, serverFrame.contentWindow, 100).then(c => {
            client = c;
            client.long().then(spy, rejectSpy);
            setTimeout(() => {
                expect(spy).to.not.have.been.called;
                expect(rejectSpy).to.have.been.called;
                done();
            }, 200);
        });
    });
});
