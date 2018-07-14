
type InvokeContext = {
    readonly call: number;
    off(): void;
    stop(): void;
    readonly ret: any;
};

// TODO: after typescript 3.0, we can change rest args to tuple.
type Func = (this: InvokeContext, ...args: any[]) => any;

type FuncInfo = {
    func: Func,
    once: boolean,
    call: number,
    isDisabled: boolean,
    shouldRemove: boolean,
};

export class EventInvoker {
    private _callbacks: FuncInfo[] = [];

    constructor() {
        this._callbacks = [];
    }

    private _add(func: Func, once: boolean, call: number = 0) {
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

    _findLastIndex(func: Func) {
        for (let index = this._callbacks.length - 1; index >= 0; index--) {
            const entity = this._callbacks[index];
            if (entity.func === func) {
                return index;
            }
        }
        return -1;
    }

    on(func: Func) {
        return this._add(func, false);
    }

    once(func: Func) {
        return this._add(func, true);
    }

    off(func: Func) {
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

    disable(func: Func) {
        const index = this._findLastIndex(func);
        if (index >= 0) {
            this._callbacks[index].isDisabled = true;
        }
        return this;
    }

    enable(func: Func) {
        const index = this._findLastIndex(func);
        if (index >= 0) {
            this._callbacks[index].isDisabled = false;
        }
        return this;
    }

    invoke(...args: any[]): any {
        let ret: any = undefined;

        if (this._callbacks.length > 0) {
            try {
                for (const entity of this._callbacks.filter(z => !z.isDisabled)) {
                    const called = {
                        off: false,
                        stop: false
                    };

                    const context: InvokeContext = {
                        call: entity.call ++, // first time should be 0.
                        off: () => called.off = true,
                        stop: () => called.stop = true,
                        ret
                    };

                    try {
                        ret = entity.func.apply(context, args.slice());
                    } finally {
                        entity.shouldRemove = called.off || entity.once;
                    }

                    if (called.stop) {
                        break;
                    }
                }
            } finally {
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

type EventKey = symbol | string;

export class EventEmitter {
    private _table = new Map<EventKey, EventInvoker>();

    getEventInvoker(eventName: EventKey, add: true): EventInvoker;
    getEventInvoker(eventName: EventKey, add: false): EventInvoker | null;
    getEventInvoker(eventName: EventKey, add: boolean): EventInvoker | null {
        let ei = this._table.get(eventName) || null;
        if (!ei && add) {
            this._table.set(eventName, ei = new EventInvoker());
        }
        return ei;
    }

    private _removeEventInvoker(eventName: EventKey) {
        this._table.delete(eventName);
    }

    on(eventName: EventKey, func: Func) {
        this.getEventInvoker(eventName, true).on(func);
        return this;
    }

    once(eventName: EventKey, func: Func) {
        this.getEventInvoker(eventName, true).once(func);
        return this;
    }

    off(eventName: EventKey, func: Func) {
        const ei = this.getEventInvoker(eventName, false);
        if (ei) {
            ei.off(func);
            if (ei.isEmpty) {
                this._removeEventInvoker(eventName);
            }
        }
        return this;
    }

    offall(eventName: EventKey | null = null) {
        if (eventName === null) {
            this._table = new Map();
        } else {
            this._removeEventInvoker(eventName);
        }
        return this;
    }

    disable(eventName: EventKey, func: Func) {
        const ei = this.getEventInvoker(eventName, false);
        if (ei) {
            ei.disable(func);
        }
        return this;
    }

    enable(eventName: EventKey, func: Func) {
        const ei = this.getEventInvoker(eventName, false);
        if (ei) {
            ei.enable(func);
        }
        return this;
    }

    emit(eventName: EventKey, ...args: any[]) {
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
        const names: EventKey[] = Object.keys(this._table);
        return names.concat(Object.getOwnPropertySymbols(this._table));
    }
}
