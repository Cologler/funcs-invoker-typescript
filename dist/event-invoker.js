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
//# sourceMappingURL=event-invoker.js.map