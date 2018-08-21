"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
function findLastIndex(src, condition) {
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
class FuncsInvoker {
    /**
     * Creates an instance of FuncsInvoker.
     *
     * @param {boolean} [_FILO=false] if set to `true`, then invoke with reverse order.
     * @memberof FuncsInvoker
     */
    constructor(_FILO = false) {
        this._FILO = _FILO;
        this._FuncInfos = [];
        this._FuncInfos = [];
    }
    _findLastIndex(func) {
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
    on(func, once = false) {
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
    off(func) {
        if (func) {
            const index = this._findLastIndex(func);
            if (index >= 0) {
                this._FuncInfos.splice(index, 1);
            }
        }
        else {
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
    disable(func) {
        if (func) {
            const index = this._findLastIndex(func);
            if (index >= 0) {
                this._FuncInfos[index].isDisabled = true;
            }
        }
        else {
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
    enable(func) {
        if (func) {
            const index = this._findLastIndex(func);
            if (index >= 0) {
                this._FuncInfos[index].isDisabled = false;
            }
        }
        else {
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
    invoke(...args) {
        let ret = undefined;
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
                    const context = {
                        Called: entity.Called++,
                        off: () => flags.off = true,
                        stop: () => flags.stop = true,
                        Ret: ret
                    };
                    try {
                        ret = entity.Func.apply(context, args.slice());
                    }
                    finally {
                        if (flags.off || entity.Once) {
                            needRemove = true;
                            entity.isRemoved = true;
                        }
                    }
                    if (flags.stop) {
                        break;
                    }
                }
            }
            finally {
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
exports.FuncsInvoker = FuncsInvoker;
class EventEmitter {
    constructor() {
        this._table = new Map();
    }
    getFuncsInvoker(eventName, add) {
        let ei = this._table.get(eventName) || null;
        if (!ei && add) {
            this._table.set(eventName, ei = new FuncsInvoker());
        }
        return ei;
    }
    _removeFuncsInvoker(eventName) {
        this._table.delete(eventName);
    }
    on(eventName, func, once = false) {
        this.getFuncsInvoker(eventName, true).on(func, once);
        return this;
    }
    off(eventName, func) {
        if (eventName === undefined) {
            this._table = new Map();
        }
        else {
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
    disable(eventName, func) {
        const fi = this.getFuncsInvoker(eventName, false);
        if (fi) {
            fi.disable(func);
        }
        return this;
    }
    enable(eventName, func) {
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
    emit(eventName, ...args) {
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
exports.EventEmitter = EventEmitter;
//# sourceMappingURL=funcs-invoker.js.map