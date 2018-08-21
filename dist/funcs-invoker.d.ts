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
 * allow user invoke multi-function with one times.
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
    readonly isEmpty: boolean;
    /**
     * get the count of functions.
     *
     * @readonly
     * @memberof FuncsInvoker
     */
    readonly Count: number;
}
declare type EventKey = PropertyKey;
export declare class EventEmitter {
    private _table;
    getFuncsInvoker(eventName: EventKey, add: true): FuncsInvoker<any[]>;
    getFuncsInvoker(eventName: EventKey, add: false): FuncsInvoker<any[]> | null;
    private _removeFuncsInvoker;
    on(eventName: EventKey, func: Func<any[]>, once?: boolean): this;
    off(eventName?: EventKey, func?: Func<any[]>): this;
    disable(eventName: EventKey, func?: Func<any[]>): this;
    enable(eventName: EventKey, func?: Func<any[]>): this;
    /**
     *
     *
     * @param {EventKey} eventName
     * @param {...any[]} args
     * @returns always return `undefined`
     * @memberof EventEmitter
     */
    emit(eventName: EventKey, ...args: any[]): any;
    getEventNames(): (string | number | symbol)[];
}
export {};
//# sourceMappingURL=funcs-invoker.d.ts.map