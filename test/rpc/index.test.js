/**
 * RPC tests.
 *
 * @copyright Realeyes OU. All rights reserved.
 */


import {expect} from 'chai';


describe('RPC integration', () => {
    let client;


    before(done => {
        const serverFrame = document.createElement('iframe');
        document.body.appendChild(serverFrame);
        serverFrame.src = '/base/test/rpc/server-frame.html';
        client = pas.CreateClient(window, serverFrame.contentWindow, '123');
        serverFrame.onload = () => done();
    });


    describe('call', () => {
        it('should return a Promise', () => {
            expect(client.foo()).to.be.an.instanceOf(Promise);
        });


        it('should reject a call to nonexistent method', (done) => {
            client.nonexistent().then(null, (err) => {
                expect(err).to.equal('Method nonexistent not found');
                done();
            });
        });


        it('should resolve a call to existing method with the result of the call', (done) => {
            client.foo().then((res) => {
                expect(res).to.equal('bar');
                done();
            });
        });
    });


    // describe('event', () => {
    //     it('should be possible to subscribe to event', (done) => {
    //         client.on('event', (payload) => {
    //             expect(payload).to.equal('event-payload');
    //             done();
    //         });
    //         server.emit('event', 'event-payload');
    //     });
    // });
});
