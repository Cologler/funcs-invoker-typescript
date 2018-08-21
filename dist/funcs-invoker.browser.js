(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.funcsInvoker = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
 * a class allow user invoke multi-function with one times.
 * a little like delegate in csharp.
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
/**
 * a simple event emitter base on `FuncsInvokers`.
 *
 * @export
 * @class EventEmitter
 */
class EventEmitter {
    constructor() {
        this._table = new Map();
    }
    _getFuncsInvoker(eventName, add) {
        let ei = this._table.get(eventName) || null;
        if (!ei && add) {
            this._table.set(eventName, ei = new FuncsInvoker());
        }
        return ei;
    }
    _removeFuncsInvoker(eventName) {
        this._table.delete(eventName);
    }
    _getFuncsInvokersOptional(eventName) {
        if (eventName) {
            const invoker = this._getFuncsInvoker(eventName, false);
            return invoker ? [invoker] : [];
        }
        else {
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
    on(eventName, func, once = false) {
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
    off(eventName, func) {
        if (eventName) {
            const invoker = this._getFuncsInvoker(eventName, false);
            if (invoker) {
                invoker.off(func);
                if (invoker.isEmpty) {
                    this._removeFuncsInvoker(eventName);
                }
            }
        }
        else {
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
    disable(eventName, func) {
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
    enable(eventName, func) {
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
    emit(eventName, ...args) {
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
exports.EventEmitter = EventEmitter;

},{}]},{},[1])(1)
});
