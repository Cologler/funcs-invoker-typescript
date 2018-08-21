
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
};

type Func<T extends any[]> = (this: InvokeContext, ...args: T) => any;

type FuncInfo<T extends any[]> = {
    Func: Func<T>,
    Once: boolean,
    Called: number,
    isDisabled: boolean,
    isRemoved: boolean,
};

function findLastIndex<T>(src: Array<T>, condition: (item: T) => boolean) {
    for (let index = src.length - 1; index >= 0; index--) {
        if (condition(src[index])) {
            return index;
        }
    }
    return -1;
}

/**
 * a class allow user invoke multi-function with one times.
 * a little like delegate in csharp.
 *
 * @export
 * @class FuncsInvoker
 * @template T
 */
export class FuncsInvoker<T extends any[]> {
    private _FuncInfos: FuncInfo<T>[] = [];

    /**
     * Creates an instance of FuncsInvoker.
     *
     * @param {boolean} [_FILO=false] if set to `true`, then invoke with reverse order.
     * @memberof FuncsInvoker
     */
    constructor(private _FILO: boolean=false) {
        this._FuncInfos = [];
    }

    _findLastIndex(func: Func<T>) {
        return findLastIndex(this._FuncInfos, e => e.Func === func);
    }

    /**
     * add a function as callback.
     *
     * @param {Func<T>} func
     * @param {boolean} [once=false]
     * @returns
     * @memberof FuncsInvoker
     */
    on(func: Func<T>, once: boolean=false) {
        if (typeof func !== 'function') {
            throw new Error('func must be function');
        }

        this._FuncInfos.push({
            Func: func,
            Once: once,
            Called: 0,
            isDisabled: false,
            isRemoved: false
        });

        return this;
    }

    /**
     * remove the last matched function from `FuncsInvoker`.
     *
     * @param {Func<T>} [func] keep empty to remove all functions.
     * @returns
     * @memberof FuncsInvoker
     */
    off(func?: Func<T>) {
        if (func) {
            const index = this._findLastIndex(func);
            if (index >= 0) {
                this._FuncInfos.splice(index, 1);
            }
        } else {
            this._FuncInfos = [];
        }
        return this;
    }

    /**
     * disable the last matched function from `FuncsInvoker`.
     *
     * @param {Func<T>} func keep empty to disable all functions.
     * @returns
     * @memberof FuncsInvoker
     */
    disable(func?: Func<T>) {
        if (func) {
            const index = this._findLastIndex(func);
            if (index >= 0) {
                this._FuncInfos[index].isDisabled = true;
            }
        } else {
            this._FuncInfos.forEach(z => z.isDisabled = true);
        }
        return this;
    }

    /**
     * enable the last matched function from `FuncsInvoker`.
     *
     * @param {Func<T>} func keep empty to enable all functions.
     * @returns
     * @memberof FuncsInvoker
     */
    enable(func?: Func<T>) {
        if (func) {
            const index = this._findLastIndex(func);
            if (index >= 0) {
                this._FuncInfos[index].isDisabled = false;
            }
        } else {
            this._FuncInfos.forEach(z => z.isDisabled = false);
        }
        return this;
    }

    /**
     * invoke all enabled function with `args`.
     *
     * return the return value of last function or `undefined` if `FuncsInvoker` is empty.
     *
     * @param {...T} args
     * @returns {*}
     * @memberof FuncsInvoker
     */
    invoke(...args: T): any {
        let ret: any = undefined;
        let needRemove = false;

        let source = this._FuncInfos.filter(z => !z.isDisabled);
        if (this._FILO) {
            source = source.reverse();
        }

        if (source.length > 0) {
            try {
                for (const entity of source) {
                    const flags = {
                        off: false,
                        stop: false
                    };

                    const context: InvokeContext = {
                        Called: entity.Called ++, // first time should be 0.
                        off: () => flags.off = true,
                        stop: () => flags.stop = true,
                        Ret: ret
                    };

                    try {
                        ret = entity.Func.apply(context, args.slice());
                    } finally {
                        if (flags.off || entity.Once) {
                            needRemove = true
                            entity.isRemoved = true;
                        }
                    }

                    if (flags.stop) {
                        break;
                    }
                }
            } finally {
                if (needRemove) {
                    this._FuncInfos = this._FuncInfos.filter(z => !z.isRemoved);
                }
            }
        }

        return ret;
    }

    /**
     * get whether the `FuncsInvoker` is empty.
     *
     * @readonly
     * @memberof FuncsInvoker
     */
    get isEmpty() {
        return this._FuncInfos.length === 0;
    }

    /**
     * get the count of functions.
     *
     * @readonly
     * @memberof FuncsInvoker
     */
    get Count() {
        return this._FuncInfos.length;
    }
}

type EventKey = PropertyKey;

/**
 * a simple event emitter base on `FuncsInvokers`.
 *
 * @export
 * @class EventEmitter
 */
export class EventEmitter {
    private _table = new Map<EventKey, FuncsInvoker<any[]>>();

    /**
     * get the `FuncsInvoker` by `eventName`.
     *
     * @param {EventKey} eventName
     * @param {true} add
     * @returns {FuncsInvoker<any[]>}
     * @memberof EventEmitter
     */
    private _getFuncsInvoker(eventName: EventKey, add: true): FuncsInvoker<any[]>;
    private _getFuncsInvoker(eventName: EventKey, add: false): FuncsInvoker<any[]> | null;
    private _getFuncsInvoker(eventName: EventKey, add: boolean): FuncsInvoker<any[]> | null {
        let ei = this._table.get(eventName) || null;
        if (!ei && add) {
            this._table.set(eventName, ei = new FuncsInvoker());
        }
        return ei;
    }

    private _removeFuncsInvoker(eventName: EventKey) {
        this._table.delete(eventName);
    }

    private _getFuncsInvokersOptional(eventName?: EventKey) {
        if (eventName) {
            const invoker = this._getFuncsInvoker(eventName, false);
            return invoker ? [invoker] : [];
        } else {
            return this._table.values();
        }
    }

    /**
     * add a callback to `FuncsInvoker` by `eventName`
     *
     * @param {EventKey} eventName
     * @param {Func<any[]>} func
     * @param {boolean} [once=false]
     * @returns
     * @memberof EventEmitter
     */
    on(eventName: EventKey, func: Func<any[]>, once: boolean=false) {
        this._getFuncsInvoker(eventName, true).on(func, once);
        return this;
    }

    /**
     * remove a callback from `FuncsInvoker` by `eventName`
     *
     * @param {EventKey} [eventName] keep empty to remove all `FuncsInvoker`.
     * @param {Func<any[]>} [func] keep empty to remove all callbacks from `FuncsInvoker`.
     * @returns
     * @memberof EventEmitter
     */
    off(eventName?: EventKey, func?: Func<any[]>) {
        if (eventName) {
            const invoker = this._getFuncsInvoker(eventName, false);
            if (invoker) {
                invoker.off(func);
                if (invoker.isEmpty) {
                    this._removeFuncsInvoker(eventName);
                }
            }
        } else {
            this._table = new Map();
        }
        return this;
    }

    /**
     * disable the last matched function from `FuncsInvoker` by `eventName`.
     *
     * @param {EventKey} eventName keep empty to disable from all `FuncsInvoker`.
     * @param {Func<any[]>} [func] keep empty to disable all callbacks from `FuncsInvoker`.
     * @returns
     * @memberof EventEmitter
     */
    disable(eventName?: EventKey, func?: Func<any[]>) {
        for (const invoker of this._getFuncsInvokersOptional(eventName)) {
            invoker.disable(func);
        }
        return this;
    }

    /**
     * enable the last matched function from `FuncsInvoker` by `eventName`.
     *
     * @param {EventKey} [eventName] keep empty to enable from all `FuncsInvoker`.
     * @param {Func<any[]>} [func] keep empty to enable all callbacks from `FuncsInvoker`.
     * @returns
     * @memberof EventEmitter
     */
    enable(eventName?: EventKey, func?: Func<any[]>) {
        for (const invoker of this._getFuncsInvokersOptional(eventName)) {
            invoker.enable(func);
        }
        return this;
    }

    /**
     *
     *
     * @param {EventKey} eventName keep empty to emit all.
     * @param {...any[]} args
     * @returns always return `undefined`
     * @memberof EventEmitter
     */
    emit(eventName?: EventKey, ...args: any[]) {
        for (const invoker of this._getFuncsInvokersOptional(eventName)) {
            invoker.invoke(...args);
        }

        for (const [key, invoker] of Array.from(this._table.entries())) {
            if (invoker.isEmpty) {
                this._removeFuncsInvoker(key);
            }
        }
    }

    getEventNames() {
        return Array.from(this._table.keys());
    }
}
