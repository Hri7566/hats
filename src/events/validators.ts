import z from "zod";
import type { IHatEvents } from ".";

export const responseValidators = new Map<string, z.ZodType>();

export function validateMessage(msg: IHatEvents[keyof IHatEvents]) {
    let key = msg.evtn;
    if (typeof key == "undefined") return false;

    const validator = responseValidators.get(key);
    if (typeof validator == "undefined") return false;

    try {
        validator.parse(msg);
        return true;
    } catch (err) {
        return false;
    }
}

responseValidators.set(
    "query",
    z.object({
        evtn: z.string()
    })
);

responseValidators.set(
    "query_reply",
    z.object({
        evtn: z.string(),
        hat: z.string()
    })
);

responseValidators.set(
    "change",
    z.object({
        evtn: z.string(),
        hat: z.string()
    })
);
