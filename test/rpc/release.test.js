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
    it('should be a function', () => {
        expect(pas.ReleaseClient).to.be.a('function');
    });


    it('should clean up the "message" event listeners for the client', done => {
        const spy = sinon.spy();
        const serverFrame = document.createElement('iframe');
        document.body.appendChild(serverFrame);
        serverFrame.src = '/base/test/rpc/server-frame.html';
        serverFrame.onload = () => {
            pas.CreateClientAsync(window, serverFrame.contentWindow).then(client => {
                client.foo().then((res) => {
                    expect(res).to.equal('bar');
                    pas.ReleaseClient(client);
                    client.foo().then(spy);
                    setTimeout(() => {
                        expect(spy).to.not.have.been.called;
                        document.body.removeChild(serverFrame);
                        done();
                    }, 100);
                });
            });
        };
    });
});
