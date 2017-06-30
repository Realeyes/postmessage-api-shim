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
`CreateServer` function requires a `window` argument and `api` argument. `api` should be an object with methods that return native ES6 `Promise` instance. In can also be an instance of node.js `EventEmitter`. In this case the server will allow to subscribe to `api` events.

## Usage of the client component

to get a reference to `CreateClient` function you can use a ES6 module
```javascript
import {CreateClient} from './'
CreateClient(window, serverFrame.contentWindow);
```
or use a browserified build, in this case `CreateClient` function will be under `pas` namespace.
```html
<script scr="dist/index.js"></script>
<script>
  var clientApi = pas.CreateClient(window, , serverFrame.contentWindow);
</script>
```

`CreateServer` function requires a `window` argument and `serverWindow` argument. After getting a `clientApi` instance you can transparently call `api` methods. All calls return a `Promise`. If the `api` implements an `EventEmitter` interface it is possible to subscribe/unsubscribe with `clientApi.on()` and  `clientApi.off()` methods.
