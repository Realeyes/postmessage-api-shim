/**
 * postMessage helper.
 *
 * @copyright Realeyes OU. All rights reserved.
 */

/**
 * Window.postMessage() wrapper.
 *
 * @param {Window} source
 * @param {?number} id
 * @param {string} type
 * @param {*=} payload
 * @param {string} _token
 */
export default (source, id, type, payload, _token) => source.postMessage({id, type, payload, _token}, '*');
