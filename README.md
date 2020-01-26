# funcs-invoker

[![](https://data.jsdelivr.com/v1/package/gh/Cologler/funcs-invoker-typescript/badge)](https://www.jsdelivr.com/package/gh/Cologler/funcs-invoker-typescript)

**WHY** a event emitter need a event name ?!

``` ts
import { FuncsInvoker } from "event-invoker";

const invoker = new FuncsInvoker<[string, string]>();
invoker.on((a, b) => {
    // this is a InvokeContext object.
    // a === 'a'
    // b === 'b'
    return 'ret_1';
});
invoker.on((a, b) => {
    // this is a InvokeContext object.
    // a === 'a'
    // b === 'b'
    return 'ret_2';
});
invoker.invoke('a', 'b'); // return 'ret_2'
```

## Installation

``` cmd
npm i funcs-invoker
```

or on browser:

``` url
https://cdn.jsdelivr.net/gh/Cologler/funcs-invoker-typescript/dist/funcs-invoker.browser.js
```
