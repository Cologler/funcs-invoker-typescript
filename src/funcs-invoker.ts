
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
 * allow user invoke multi-function with one times.
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

export class EventEmitter {
    private _table = new Map<EventKey, FuncsInvoker<any[]>>();

    getFuncsInvoker(eventName: EventKey, add: true): FuncsInvoker<any[]>;
    getFuncsInvoker(eventName: EventKey, add: false): FuncsInvoker<any[]> | null;
    getFuncsInvoker(eventName: EventKey, add: boolean): FuncsInvoker<any[]> | null {
        let ei = this._table.get(eventName) || null;
        if (!ei && add) {
            this._table.set(eventName, ei = new FuncsInvoker());
        }
        return ei;
    }

    private _removeFuncsInvoker(eventName: EventKey) {
        this._table.delete(eventName);
    }

    on(eventName: EventKey, func: Func<any[]>, once: boolean=false) {
        this.getFuncsInvoker(eventName, true).on(func, once);
        return this;
    }

    off(eventName?: EventKey, func?: Func<any[]>) {
        if (eventName === undefined) {
            this._table = new Map();
        } else {
            const fi = this.getFuncsInvoker(eventName, false);
            if (fi) {
                fi.off(func);
                if (fi.isEmpty) {
                    this._removeFuncsInvoker(eventName);
                }
            }
        }
        return this;
    }

    disable(eventName: EventKey, func?: Func<any[]>) {
        const fi = this.getFuncsInvoker(eventName, false);
        if (fi) {
            fi.disable(func);
        }
        return this;
    }

    enable(eventName: EventKey, func?: Func<any[]>) {
        const fi = this.getFuncsInvoker(eventName, false);
        if (fi) {
            fi.enable(func);
        }
        return this;
    }

    /**
     *
     *
     * @param {EventKey} eventName
     * @param {...any[]} args
     * @returns always return `undefined`
     * @memberof EventEmitter
     */
    emit(eventName: EventKey, ...args: any[]) {
        const fi = this.getFuncsInvoker(eventName, false);
        if (fi) {
            const ret = fi.invoke(...args);
            if (fi.isEmpty) {
                this._removeFuncsInvoker(eventName);
            }
            return ret;
        }
        return undefined;
    }

    getEventNames() {
        return Array.from(this._table.keys());
    }
}
