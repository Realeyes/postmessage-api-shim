/**
 * Window.postMessage() wrapper.
 *
 * @param {Window} source
 * @param {?number} id
 * @param {string} type
 * @param {*=} payload
 */
export default (source, id, type, payload) => {
    source.postMessage({id, type, payload}, '*')
};
