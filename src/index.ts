import { e } from "./events";
import { validateMessage } from "./events/validators";
import * as hats from "./hat";
import $ from "jquery";

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
    `<button class="mpp-hats-button top-button">
        <img id="mpp-hats-button-icon" src="https://hats.hri7566.info/api/hat?id=tophat" style="vertical-align: middle;">
        Hats
    </button>`
);

$(".mpp-hats-button").css({
    position: "fixed",
    right: "6px",
    top: "58px",
    "z-index": "100"
});

$(".mpp-hats-button").on("click", async () => {
    const grid = $("#modal #modals #hats #hat-grid");
    grid.empty();

    // Add "None" option first
    grid.append(
        `<div class="hat-tile" data-hat-id="">
            <div class="hat-tile-img" style="width:32px;height:32px;margin:0 auto;opacity:0.3;font-size:20px;line-height:32px;text-align:center;">✕</div>
            <div class="hat-tile-name">None</div>
        </div>`
    );

    MPP.modal.openModal("#modal #modals #hats");

    const list = await hats.getHatList();

    for (const hatId of Object.keys(list)) {
        const hatName = list[hatId];
        grid.append(
            `<div class="hat-tile" data-hat-id="${hatId}">
                <img class="hat-tile-img" src="${hats.getHatBaseURL(hatId)}" width="32" height="32">
                <div class="hat-tile-name">${hatName}</div>
            </div>`
        );
    }

    // Highlight current hat
    setSelectedTile(hats.getCurrentHat());
});

// Add hat selector menu

$("head").append(`<style>
    #hats #hat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(58px, 1fr));
        gap: 4px;
        overflow-y: auto;
        max-height: 155px;
        padding: 4px;
        box-sizing: border-box;
    }
    .hat-tile {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        padding: 5px 3px;
        border-radius: 5px;
        border: 2px solid transparent;
        cursor: pointer;
        transition: background 0.1s, border-color 0.1s;
    }
    .hat-tile:hover {
        background: rgba(255,255,255,0.08);
    }
    .hat-tile.selected {
        border-color: #7eb8f7;
        background: rgba(126,184,247,0.12);
    }
    .hat-tile-img {
        image-rendering: pixelated;
        display: block;
    }
    .hat-tile-name {
        font-size: 9px;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        opacity: 0.85;
    }
</style>`);

$("#modals").append(`
<div id="hats" class="dialog" style="height: 260px; margin-top: -130px; display: none;">
    <h3 style="margin-bottom: 6px;">MPP Hats</h3>
    <hr style="margin-bottom: 8px;" />
    <div id="hat-grid"></div>
    <div style="display: flex; gap: 6px; margin-top: 8px;">
        <button class="submit" style="flex: 1; margin: 0;">SUBMIT</button>
        <div class="ugly-button clear-cache" style="flex-shrink: 0;">Clear Cache</div>
    </div>
</div>`);

function setSelectedTile(hatId: string) {
    $("#modal #modals #hats .hat-tile").removeClass("selected");
    $(`#modal #modals #hats .hat-tile[data-hat-id="${hatId}"]`).addClass("selected");
}

$("#modal #modals #hats").on("click", ".hat-tile", function() {
    setSelectedTile($(this).data("hat-id"));
});

$("#modal #modals #hats button.submit").on("click", () => {
    const selectedHat = ($("#modal #modals #hats .hat-tile.selected").data("hat-id") ?? "") as string;
    hats.changeHat(selectedHat);
    MPP.modal.closeModal();
});

$("#modal #modals #hats .clear-cache").on("click", () => {
    hats.clearHatCache();
});

// MPP events
const customMessagePrefix = "hat_";

MPP.client.on("custom", m => {
    // pass by reference moment
    const msg = { ...m };

    // Remove prefix and store in the correct property for the emitter to work
    if (typeof msg.data !== "object") return;
    if (typeof msg.data.m !== "string") return;
    msg.data.evtn = msg.data.m.substring(customMessagePrefix.length).trim();
    delete msg.data.m;

    // Validate message
    if (!validateMessage(msg.data)) return;

    // Emit data
    e.emit(msg.data, msg);
});

MPP.client.on("participant added", p => {
    hats.getPartHat(p._id);
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

    for (let i = 0; i < msg.c.length; i++) {
        try {
            const a = msg.c[i];
            if ((a.m as string) == "dm") continue;

            const p = MPP.client.findParticipantById(a.p.id);
            if (!p) continue;

            const hatId = hats.getPartHat(p._id);
            if (!hatId) continue;

            const span = `<span class="chat-hat" style="content: url(${hats.getHatBaseURL(
                hatId
            )});"></span>`;
            const chatMessage = $(`#chat ul li#msg-${a.id}`);

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
        if (!hatId) return;

        const span = `<span class="chat-hat" style="content: url(${hats.getHatBaseURL(
            hatId
        )});"></span>`;
        const chatMessage = $(`#chat ul li#msg-${msg.id}`);

        $(chatMessage).children(".name").before(span);
    } catch (err) {
        console.error(err);
    }
});

// Apply hat immediately if already in a channel when the script loads
if (MPP.client.channel) {
    hats.changeHat(hats.getCurrentHat());
}

// global for baby
(MPP as any).hats = hats;
