/**
 * PostMessage server.
 *
 * @copyright Realeyes OU. All rights reserved.
 */


import post from '../utils/post';


export default function (serverWindow, api) {
    serverWindow.addEventListener('message', ({ data: { id, method, args = [] }, source }) => {
        if (typeof api[method] !== 'function') {
            return post(source, id, 'error', new TypeError(`Method ${method} not found`));
        }

        if (method === 'on') {
            const name = args[0];
            api.on(name, (...args) => {
                post(source, null, 'event', { name, args });
            });

            return post(source, id, 'response');
        }

        if (method === 'off') {
            api.off(args[0]);

            return post(source, id, 'response');
        }

        api[method](...args).then((...args) => post(source, id, 'response', args),
                                  (...args) => post(source, id, 'error', args));
    });
}
