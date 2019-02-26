# postmessage-api-shim

## Setup

```bash
$ npm install
```

## Build

```bash
$ npm run build
```

## Test

```bash
$ npm test
```

## Usage of the server component

to get a reference to `CreateServer` function you can use a ES6 module
```javascript
import {CreateServer} from './'
CreateServer(window, api);
```
or use a browserified build, in this case `CreateServer` function will be under `pas` namespace.
```html
<script scr="dist/index.js"></script>
<script>
  pas.CreateServer(window, api);
</script>
```
`CreateServer` function requires a `window` argument and `api` argument. `api` should be an object with methods that
return native ES6 `Promise` instance. In can also be an instance of node.js `EventEmitter`. In this case the server will
allow to subscribe to `api` events.

Please don't forget to add `Promise` polyfill for Internet Explorer 10 and lower.

`CreateServer` also has two optional parameters:
- __token__ (string, defaults to "defaultToken"): a unique identifier that identifies messages emitted by and sent to the server. *There should never be two servers within the same window with the same token!*
- __addSourceToApiCall__ (boolean, defaults to false): if true *all* server api methods' got the reference of the client window as first parameter. Useful in case you need to do any action on the client's window upon a method call.

## Usage of the client component

to get a reference to `CreateClientAsync` function you can use a ES6 module
```javascript
import {CreateClientAsync} from './'
CreateClientAsync(window, serverFrame.contentWindow);
```
or use a browserified build, in this case `CreateClientAsync` function will be under `pas` namespace.
```html
<script scr="dist/index.js"></script>
<script>
  pas.CreateClientAsync(window, serverFrame.contentWindow).then(function(clientApi) {
      // you can start calling methods on the clientApi
  });
</script>
```

`CreateClientAsync` function requires a `window` argument and `serverWindow` argument. After getting a `clientApi` instance
you can transparently call `api` methods. All calls return a `Promise`. If the `api` implements an `EventEmitter`
interface it is possible to subscribe/unsubscribe with `clientApi.on()` and  `clientApi.off()` methods.

`CreateClientAsync` also has two optional parameters:
- __timeout__ (number, defaults to 30000): period (in milliseconds) after which the client stop waiting for the answer and rejects the promise returned
- __token__ (string, defaults to "defaultToken"): a unique identifier that identifies messages emitted by and sent to the server. Should match the token of the server!