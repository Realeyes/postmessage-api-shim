/**
 * uid util tests.
 *
 * @copyright Realeyes OU. All rights reserved.
 */


import {expect} from 'chai';
import uid from '../../lib/utils/uid';


describe('uid', () => {
    it('should be a function', () => {
        expect(uid).to.be.a('function');
    });

    
    it('should generate auto incremented numbers', () => {
        expect(uid() + 1).to.equal(uid());
    })
});
