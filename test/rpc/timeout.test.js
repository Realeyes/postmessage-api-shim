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
    it('should not reject the call if the timeout does not exceed the limit', done => {
        const spy = sinon.spy();
        const serverFrame = document.createElement('iframe');
        document.body.appendChild(serverFrame);
        serverFrame.src = '/base/test/rpc/server-frame.html';
        serverFrame.onload = () => {
            const client = pas.CreateClient(window, serverFrame.contentWindow, 200);
            client.long().then(spy);
            setTimeout(() => {
                expect(spy).to.have.been.called;
                pas.ReleaseClient(client);
                document.body.removeChild(serverFrame);
                done();
            }, 250);
        };
    });

    it('should reject the call if the timeout exceeds the limit', done => {
        const spy = sinon.spy();
        const rejectSpy = sinon.spy();
        const serverFrame = document.createElement('iframe');
        document.body.appendChild(serverFrame);
        serverFrame.src = '/base/test/rpc/server-frame.html';
        serverFrame.onload = () => {
            const client = pas.CreateClient(window, serverFrame.contentWindow, 100);
            client.long().then(spy, rejectSpy);
            setTimeout(() => {
                expect(spy).to.not.have.been.called;
                expect(rejectSpy).to.have.been.called;
                pas.ReleaseClient(client);
                document.body.removeChild(serverFrame);
                done();
            }, 200);
        };
    });
});
