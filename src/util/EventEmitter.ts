export type TEventListener<IEventData> = (
    evtd: IEventData,
    orig?: unknown
) => void;

export interface IEventListenerContainer<IEventData> {
    once: boolean;
    listener: TEventListener<IEventData>;
}

export interface IEventStruct<EventName extends string = string> {
    evtn: EventName;
}

export type TEventData<TEventUnion> = TEventUnion[keyof TEventUnion];

export type IEventDict<K extends string> = Record<string, IEventStruct<K>>;

export class EventEmitter<EventUnion extends IEventDict<string>> {
    private _events: Partial<
        Record<
            keyof EventUnion,
            IEventListenerContainer<EventUnion[keyof EventUnion]>[]
        >
    > = {};

    public on<EventName extends keyof EventUnion>(
        evtn: EventName,
        listener: IEventListenerContainer<EventUnion[EventName]>["listener"]
    ) {
        if (typeof this._events[evtn] == "undefined") this._events[evtn] = [];

        const container = {
            once: false,
            listener: listener as any
        };

        this._events[evtn].push(container);
    }

    public off(
        evtn: keyof EventUnion,
        callback: IEventListenerContainer<
            EventUnion[keyof EventUnion]
        >["listener"]
    ) {
        if (typeof this._events[evtn] == "undefined") return;

        for (let i in this._events[evtn]) {
            if (typeof i !== "number") continue;
            if (!(i in this._events[evtn][i])) continue;

            const cb = this._events[evtn][i];
            if (cb.listener !== callback) continue;

            this._events[evtn].splice(i, 1);
        }
    }

    public once<EventName extends keyof EventUnion>(
        evtn: EventName,
        listener: IEventListenerContainer<EventUnion[EventName]>["listener"]
    ) {
        if (typeof this._events[evtn] == "undefined") return;

        this._events[evtn].push({
            once: true,
            listener: listener as any
        });
    }

    public emit<EventName extends keyof EventUnion>(
        evtd: EventUnion[EventName],
        orig?: unknown
    ) {
        const eventName = evtd.evtn;
        if (!eventName) return;
        if (typeof this._events[eventName] == "undefined") {
            return;
        }

        for (let i in this._events[evtd.evtn]) {
            if (isNaN(parseInt(i))) {
                continue;
            }

            if (typeof this._events[eventName][i] == "undefined") {
                continue;
            }

            const container: IEventListenerContainer<
                EventUnion[keyof EventUnion]
            > = this._events[eventName][i] as any;

            if (!container) continue;
            if (container.once) this._events[eventName].splice(parseInt(i), 1);

            container.listener(evtd, orig);
        }
    }
}
