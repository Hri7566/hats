import { e } from "./events";
import { validateMessage } from "./events/validators";
import * as hats from "./hat";
import { closeModal, openModal } from "./modal";
import { customReply } from "./util/custom";

// Weird workaround since the client's EventEmitter class doesn't have "once"
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

if (!MPP.client.isConnected()) {
    // if we're loading before we're connected
    MPP.client.on("hi", setup);
} else {
    // if we're loading after we're connected
    setup();
}

// Add hat selector button
$("body").append(
    `<button class="mpp-hats-button top-button" aria-hidden="true"><img src="https://hats.hri7566.info/api/hat?id=tophat" style="vertical-align: middle;">Hats</button>`
);

$(".mpp-hats-button").css({
    position: "fixed",
    right: "6px",
    top: "58px"
});

$(".mpp-hats-button").on("click", async () => {
    openModal("#modal #modals #hats");

    $(
        `#modal #modals #hats #hat-selector option[value=${hats.getCurrentHat()}]`
    ).attr("selected", "true");

    const list = await hats.getHatList();

    for (const hatId of Object.keys(list)) {
        const hatName = list[hatId];
        $(`#modal #modals #hats #hat-selector`).append(
            `<option value="${hatId}">${hatName}</option>`
        );
    }
});

// Add hat selector menu

$("#modals").append(`
<div id="hats" class="dialog" style="height: 115px; margin-top: -90px; display: none;">
    <h4>Hats</h4>
    <hr />
    <p>
        <label>Select hat: &nbsp;
            <select id="hat-selector">
                <option value="">None</option>
            </select>
        </label>
    </p>
    <button class="submit">SUBMIT</button>
</div>`);

$("#modal #modals #hats button.submit").on("click", () => {
    let selectedHat = $("#modal #modals #hats #hat-selector").val() as string;
    hats.changeHat(selectedHat);
    closeModal();
});

// MPP events

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

MPP.client.on("participant added", p => {
    customReply(p._id, { m: "hat_query" });
});

MPP.client.on("participant removed", p => {
    hats.uncachePartHat(p._id);
});

MPP.client.on("participant update", p => {
    const hatId = hats.getPartHat(p._id);
    if (!hatId) return;
    hats.applyHat(p._id, hatId);
});

MPP.client.on("ch", msg => {
    // Set hat on "first" join
    hats.changeHat(hats.getCurrentHat());
});

MPP.client.on("c", async msg => {
    // Append hats to chat history
    if (typeof msg.c !== "object") return;
    if (!Array.isArray) return;

    console.log(msg);

    for (let i = 0; i < msg.c.length; i++) {
        try {
            const a = msg.c[i];
            if (a.m == "dm") continue;

            const p = MPP.client.findParticipantById(a.p.id);
            console.log(p);
            if (!p) continue;

            const hatId = hats.getPartHat(p._id);
            console.log(hatId);
            if (!hatId) continue;

            const span = `<span class="chat-hat" style="content: url(${hats.getHatBaseURL(
                hatId
            )});"></span>`;
            const chatMessage = $(`#chat ul li#msg-${a.id}`);

            console.log(span);
            console.log(chatMessage);

            $(chatMessage).children(".name").before(span);
        } catch (err) {
            console.error(err);
            continue;
        }
    }
});

MPP.client.on("a", msg => {
    // Append hat to chat message
    try {
        const p = MPP.client.findParticipantById(msg.p.id);
        if (!p) return;

        const hatId = hats.getPartHat(p._id);
        console.log(hatId);
        if (!hatId) return;

        const span = `<span class="chat-hat" style="content: url(${hats.getHatBaseURL(
            hatId
        )});"></span>`;
        const chatMessage = $(`#chat ul li#msg-${msg.id}`);

        console.log(span);
        console.log(chatMessage);

        $(chatMessage).children(".name").before(span);
    } catch (err) {
        console.error(err);
    }
});

// global for baby
(MPP as any).hats = hats;
