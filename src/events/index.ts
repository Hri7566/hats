import { getCurrentHat } from "~/hat";
import { customReply } from "~/util/custom";
import { EventEmitter, type IEventDict } from "~/util/EventEmitter";

export interface IHatEventKeys {
    query: string;
    query_reply: string;
    log: string;
    change: string;
}

export interface IHatEvents extends IEventDict<keyof IHatEventKeys> {
    query: {
        evtn: "query";
    };

    query_reply: {
        evtn: "query_reply";
        hat: string;
    };

    change: {
        evtn: "change";
        hat: string;
    };
}

export const e = new EventEmitter<IHatEvents>();
(globalThis as any).e = e;

// Main hat events

e.on("query", (msg, orig) => {
    console.log("received query");

    const p = (orig as any).p;

    console.log(orig);

    MPP.client.sendArray([
        {
            m: "custom",
            target: {
                mode: "id",
                id: p
            },
            data: {
                m: "query_reply",
                hat: getCurrentHat()
            }
        }
    ]);
});

e.on("query_reply", msg => {
    console.log("received query_reply");
});

e.on("change", msg => {
    console.log("received change");
});
