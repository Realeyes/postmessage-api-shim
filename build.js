/**
 * Entry point for browserify. Used to build a version for browser.
 * Exports postmessage-api-shim functions to the window namespace.
 *
 * @copyright Realeyes OU. All rights reserved.
 */

import * as pas from './index';
var Promise = require('es6-promise-polyfill').Promise;

window.pas = pas;
