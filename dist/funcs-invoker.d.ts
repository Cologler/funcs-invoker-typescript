interface InvokeContext {
    /**
     * the count of the function be called.
     * the value of first times is 0.
     *
     * @type {number}
     */
    readonly Called: number;
    /**
     * the return value of previous function.
     *
     * @type {*}
     */
    readonly Ret: any;
    /**
     * `off` current function, than it will be remove after `invoke()`
     *
     */
    off(): void;
    /**
     * `stop` emit, so next function will not be call.
     *
     */
    stop(): void;
}
declare type Func<T extends any[]> = (this: InvokeContext, ...args: T) => any;
/**
 * a class allow user invoke multi-function with one times.
 * a little like delegate in csharp.
 *
 * @export
 * @class FuncsInvoker
 * @template T
 */
export declare class FuncsInvoker<T extends any[]> {
    private _FILO;
    private _FuncInfos;
    /**
     * Creates an instance of FuncsInvoker.
     *
     * @param {boolean} [_FILO=false] if set to `true`, then invoke with reverse order.
     * @memberof FuncsInvoker
     */
    constructor(_FILO?: boolean);
    _findLastIndex(func: Func<T>): number;
    /**
     * add a function as callback.
     *
     * @param {Func<T>} func
     * @param {boolean} [once=false]
     * @returns
     * @memberof FuncsInvoker
     */
    on(func: Func<T>, once?: boolean): this;
    /**
     * remove the last matched function from `FuncsInvoker`.
     *
     * @param {Func<T>} [func] keep empty to remove all functions.
     * @returns
     * @memberof FuncsInvoker
     */
    off(func?: Func<T>): this;
    /**
     * disable the last matched function from `FuncsInvoker`.
     *
     * @param {Func<T>} func keep empty to disable all functions.
     * @returns
     * @memberof FuncsInvoker
     */
    disable(func?: Func<T>): this;
    /**
     * enable the last matched function from `FuncsInvoker`.
     *
     * @param {Func<T>} func keep empty to enable all functions.
     * @returns
     * @memberof FuncsInvoker
     */
    enable(func?: Func<T>): this;
    /**
     * invoke all enabled function with `args`.
     *
     * return the return value of last function or `undefined` if `FuncsInvoker` is empty.
     *
     * @param {...T} args
     * @returns {*}
     * @memberof FuncsInvoker
     */
    invoke(...args: T): any;
    /**
     * get whether the `FuncsInvoker` is empty.
     *
     * @readonly
     * @memberof FuncsInvoker
     */
    get isEmpty(): boolean;
    /**
     * get the count of functions.
     *
     * @readonly
     * @memberof FuncsInvoker
     */
    get Count(): number;
}
declare type EventKey = PropertyKey;
/**
 * a simple event emitter base on `FuncsInvokers`.
 *
 * @export
 * @class EventEmitter
 */
export declare class EventEmitter {
    private _table;
    /**
     * get the `FuncsInvoker` by `eventName`.
     *
     * @param {EventKey} eventName
     * @param {true} add
     * @returns {FuncsInvoker<any[]>}
     * @memberof EventEmitter
     */
    private _getFuncsInvoker;
    private _removeFuncsInvoker;
    private _getFuncsInvokersOptional;
    /**
     * add a callback to `FuncsInvoker` by `eventName`
     *
     * @param {EventKey} eventName
     * @param {Func<any[]>} func
     * @param {boolean} [once=false]
     * @returns
     * @memberof EventEmitter
     */
    on(eventName: EventKey, func: Func<any[]>, once?: boolean): this;
    /**
     * remove a callback from `FuncsInvoker` by `eventName`
     *
     * @param {EventKey} [eventName] keep empty to remove all `FuncsInvoker`.
     * @param {Func<any[]>} [func] keep empty to remove all callbacks from `FuncsInvoker`.
     * @returns
     * @memberof EventEmitter
     */
    off(eventName?: EventKey, func?: Func<any[]>): this;
    /**
     * disable the last matched function from `FuncsInvoker` by `eventName`.
     *
     * @param {EventKey} eventName keep empty to disable from all `FuncsInvoker`.
     * @param {Func<any[]>} [func] keep empty to disable all callbacks from `FuncsInvoker`.
     * @returns
     * @memberof EventEmitter
     */
    disable(eventName?: EventKey, func?: Func<any[]>): this;
    /**
     * enable the last matched function from `FuncsInvoker` by `eventName`.
     *
     * @param {EventKey} [eventName] keep empty to enable from all `FuncsInvoker`.
     * @param {Func<any[]>} [func] keep empty to enable all callbacks from `FuncsInvoker`.
     * @returns
     * @memberof EventEmitter
     */
    enable(eventName?: EventKey, func?: Func<any[]>): this;
    /**
     *
     *
     * @param {EventKey} eventName keep empty to emit all.
     * @param {...any[]} args
     * @returns always return `undefined`
     * @memberof EventEmitter
     */
    emit(eventName?: EventKey, ...args: any[]): void;
    getEventNames(): (string | number | symbol)[];
}
export {};
//# sourceMappingURL=funcs-invoker.d.ts.map