import {expect} from 'chai';
import post from '../../lib/utils/post';

describe('post', () => {
    it('should be a function', () => {
        expect(post).to.be.a('function');
    });
});
