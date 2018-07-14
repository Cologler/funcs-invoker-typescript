(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.eventInvoker = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventInvoker {
    constructor() {
        this._callbacks = [];
        this._callbacks = [];
    }
    _add(func, once, call = 0) {
        if (typeof func !== 'function') {
            throw new Error('func must be function');
        }
        this._callbacks.push({
            func,
            once,
            call,
            isDisabled: false,
            shouldRemove: false
        });
        return this;
    }
    _findLastIndex(func) {
        for (let index = this._callbacks.length - 1; index >= 0; index--) {
            const entity = this._callbacks[index];
            if (entity.func === func) {
                return index;
            }
        }
        return -1;
    }
    on(func) {
        return this._add(func, false);
    }
    once(func) {
        return this._add(func, true);
    }
    off(func) {
        const index = this._findLastIndex(func);
        if (index >= 0) {
            this._callbacks.splice(index, 1);
        }
        return this;
    }
    offall() {
        this._callbacks = [];
        return this;
    }
    disable(func) {
        const index = this._findLastIndex(func);
        if (index >= 0) {
            this._callbacks[index].isDisabled = true;
        }
        return this;
    }
    enable(func) {
        const index = this._findLastIndex(func);
        if (index >= 0) {
            this._callbacks[index].isDisabled = false;
        }
        return this;
    }
    invoke(...args) {
        let ret = undefined;
        if (this._callbacks.length > 0) {
            try {
                for (const entity of this._callbacks.filter(z => !z.isDisabled)) {
                    const called = {
                        off: false,
                        stop: false
                    };
                    const context = {
                        call: entity.call++,
                        off: () => called.off = true,
                        stop: () => called.stop = true,
                        ret
                    };
                    try {
                        ret = entity.func.apply(context, args.slice());
                    }
                    finally {
                        entity.shouldRemove = called.off || entity.once;
                    }
                    if (called.stop) {
                        break;
                    }
                }
            }
            finally {
                if (this._callbacks.some(z => z.shouldRemove)) {
                    this._callbacks = this._callbacks.filter(z => !z.shouldRemove);
                }
            }
        }
        return ret;
    }
    get isEmpty() {
        return this._callbacks.length === 0;
    }
    get count() {
        return this._callbacks.length;
    }
}
exports.EventInvoker = EventInvoker;
class EventEmitter {
    constructor() {
        this._table = new Map();
    }
    getEventInvoker(eventName, add) {
        let ei = this._table.get(eventName) || null;
        if (!ei && add) {
            this._table.set(eventName, ei = new EventInvoker());
        }
        return ei;
    }
    _removeEventInvoker(eventName) {
        this._table.delete(eventName);
    }
    on(eventName, func) {
        this.getEventInvoker(eventName, true).on(func);
        return this;
    }
    once(eventName, func) {
        this.getEventInvoker(eventName, true).once(func);
        return this;
    }
    off(eventName, func) {
        const ei = this.getEventInvoker(eventName, false);
        if (ei) {
            ei.off(func);
            if (ei.isEmpty) {
                this._removeEventInvoker(eventName);
            }
        }
        return this;
    }
    offall(eventName = null) {
        if (eventName === null) {
            this._table = new Map();
        }
        else {
            this._removeEventInvoker(eventName);
        }
        return this;
    }
    disable(eventName, func) {
        const ei = this.getEventInvoker(eventName, false);
        if (ei) {
            ei.disable(func);
        }
        return this;
    }
    enable(eventName, func) {
        const ei = this.getEventInvoker(eventName, false);
        if (ei) {
            ei.enable(func);
        }
        return this;
    }
    emit(eventName, ...args) {
        const ei = this.getEventInvoker(eventName, false);
        if (ei) {
            const ret = ei.invoke(...args);
            if (ei.isEmpty) {
                this._removeEventInvoker(eventName);
            }
            return ret;
        }
        return undefined;
    }
    eventNames() {
        const names = Object.keys(this._table);
        return names.concat(Object.getOwnPropertySymbols(this._table));
    }
}
exports.EventEmitter = EventEmitter;

},{}]},{},[1])(1)
});
