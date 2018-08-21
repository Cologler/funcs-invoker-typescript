import { FuncsInvoker } from "./funcs-invoker";
import { strictEqual, deepStrictEqual, fail } from "assert";

const equal = strictEqual;
const deepEqual = deepStrictEqual;

describe('FuncsInvoker', function() {

    describe('#on()', function() {
        it('should equals count of function', function() {
            const func = () => {};
            const invoker = new FuncsInvoker();
            equal(invoker.Count, 0);
            invoker.on(func);
            equal(invoker.Count, 1);
            invoker.on(func);
            equal(invoker.Count, 2);
            invoker.off(func);
            equal(invoker.Count, 1);
            invoker.off(func);
            equal(invoker.Count, 0);
        });

        it('should not affect by enable or disable', function() {
            const func = () => {};
            const invoker = new FuncsInvoker();
            invoker.on(func);
            equal(invoker.Count, 1);
            invoker.disable(func);
            equal(invoker.Count, 1);
            invoker.enable(func);
            equal(invoker.Count, 1);
        });
    });

    describe('#off()', function() {
        it('should can `off()` function', function() {
            const func = () => {};
            const invoker = new FuncsInvoker();
            invoker.on(func);
            invoker.on(func);
            invoker.on(func);
            equal(invoker.Count, 3);
            invoker.off(func);
            equal(invoker.Count, 2);
        });

        it('should can `off()` all functions', function() {
            const func = () => {};
            const invoker = new FuncsInvoker();
            invoker.on(func);
            invoker.on(func);
            invoker.on(func);
            equal(invoker.Count, 3);
            invoker.off();
            equal(invoker.Count, 0);
        });
    });

    describe('#invoke()', function() {
        it('should call function one by one (default: FIFO)', function() {
            let list: number[] = [];
            let last = undefined;
            const invoker = new FuncsInvoker();
            invoker.on(() => {
                list.push(1);
                last = 1;
            });
            invoker.on(() => {
                list.push(2);
                last = 2;
            });
            invoker.invoke();
            deepEqual(list, [1, 2]);
            equal(last, 2);
        });

        it('should call function one by one (FILO)', function() {
            let list: number[] = [];
            let last = undefined;
            const invoker = new FuncsInvoker(true);
            invoker.on(() => {
                list.push(1);
                last = 1;
            });
            invoker.on(() => {
                list.push(2);
                last = 2;
            });
            invoker.invoke();
            deepEqual(list, [2, 1]);
            equal(last, 1);
        });

        it('should not call disabled function', function() {
            let value = undefined;
            const invoker = new FuncsInvoker();
            const func = () => {
                value = 1;
            };
            invoker.on(func);
            invoker.disable(func);
            invoker.invoke();
            equal(value, undefined);
            invoker.enable(func);
            invoker.invoke();
            equal(value, 1);
        });

        it('should has return value', function() {
            const invoker = new FuncsInvoker();
            equal(invoker.invoke(), undefined);
            invoker.on(() => {
                return 1;
            });
            equal(invoker.invoke(), 1);
        });
    });

    describe('#invoke(this:InvokeContext)', function() {

        it('should has call count', function() {
            const invoker = new FuncsInvoker();
            invoker.on(function() {
                return this.Called;
            });
            equal(invoker.invoke(), 0);
            equal(invoker.invoke(), 1);
            equal(invoker.invoke(), 2);
        });

        it('should can return last return from context', function() {
            const invoker = new FuncsInvoker();
            invoker.on(function() {
                return 100;
            });
            invoker.on(function() {
                return this.Ret;
            });
            equal(invoker.invoke(), 100);
        });

        it('should stop call the next after call `stop()`', function() {
            let value = undefined;
            const invoker = new FuncsInvoker();
            invoker.on(function() {
                value = 0;
                return 0;
            });
            invoker.on(function() {
                value = 1;
                this.stop();
                return 1;
            });
            invoker.on(function() {
                fail();
            });
            equal(invoker.invoke(), 1);
            equal(value, 1);
        });

        it('should can `off()` in context', function() {
            const invoker = new FuncsInvoker();
            invoker.on(function() {
                this.off();
                return 100;
            });
            equal(invoker.invoke(), 100);
            equal(invoker.Count, 0);
            equal(invoker.invoke(), undefined);
        });
    });

    describe('#invoke(args)', function() {

        it('should has args', function() {
            const params: [number, number, number] = [1, 2, 3];
            const invoker = new FuncsInvoker<[number, number, number]>();
            invoker.on(function(...args) {
                deepEqual(args, params);
            });
            invoker.on(function(...args) {
                deepEqual(args, params);
            });
            invoker.invoke(...params);
        });
    });
});
