declare type InvokeContext = {
    readonly call: number;
    off(): void;
    stop(): void;
    readonly ret: any;
};
declare type Func = (this: InvokeContext, ...args: any[]) => any;
export declare class EventInvoker {
    private _callbacks;
    constructor();
    private _add;
    _findLastIndex(func: Func): number;
    on(func: Func): this;
    once(func: Func): this;
    off(func: Func): this;
    offall(): this;
    disable(func: Func): this;
    enable(func: Func): this;
    invoke(...args: any[]): any;
    readonly isEmpty: boolean;
    readonly count: number;
}
declare type EventKey = symbol | string;
export declare class EventEmitter {
    private _table;
    getEventInvoker(eventName: EventKey, add: true): EventInvoker;
    getEventInvoker(eventName: EventKey, add: false): EventInvoker | null;
    private _removeEventInvoker;
    on(eventName: EventKey, func: Func): this;
    once(eventName: EventKey, func: Func): this;
    off(eventName: EventKey, func: Func): this;
    offall(eventName?: EventKey | null): this;
    disable(eventName: EventKey, func: Func): this;
    enable(eventName: EventKey, func: Func): this;
    emit(eventName: EventKey, ...args: any[]): any;
    eventNames(): (string | symbol)[];
}
export {};
//# sourceMappingURL=event-invoker.d.ts.map