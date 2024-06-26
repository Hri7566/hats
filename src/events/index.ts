import { getCurrentHat, setPartHat } from "~/hat";
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
    const p = (orig as any).p;

    customReply(p, {
        m: "hat_query_reply",
        hat: getCurrentHat()
    });
});

e.on("query_reply", async (msg, orig) => {
    await setPartHat((orig as any).p as string, msg.hat);
});

e.on("change", async (msg, orig) => {
    await setPartHat((orig as any).p as string, msg.hat);
});
