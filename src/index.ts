import { e } from "./events";
import { validateMessage } from "./events/validators";
import * as hats from "./hat";

// workaround since we don't have "once"
function setup() {
    // Subscribe to custom stuff
    MPP.client.sendArray([
        {
            m: "+custom"
        }
    ]);

    console.log("%cMPP hats loaded", "color: #8d3f50; font-size: 14pt;");

    MPP.client.off("hi", setup);
}

// if we're loading before we're connected
MPP.client.on("hi", setup);

// if we're loading after we're connected
if (MPP.client.isConnected()) {
    setup();
}

const customMessagePrefix = "hat_";

MPP.client.on("custom", msg => {
    if (typeof msg.data.m == "undefined") return;

    // Remove prefix and store in the correct property for the emitter to work
    msg.data.evtn = msg.data.m.substring(customMessagePrefix.length).trim();
    delete msg.data.m;

    // Validate message
    if (!validateMessage(msg.data)) return;

    // Emit data
    e.emit(msg.data, msg);
});

// global for baby
(MPP as any).hats = hats;
