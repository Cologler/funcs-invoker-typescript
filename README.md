# funcs-invoker

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
