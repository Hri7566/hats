import { customReply } from "./util/custom";
import { RateLimit } from "./util/RateLimit";

export const serverAddress = "https://hats.hri7566.info/api";

const queryLimit = new RateLimit(100, 1000);

let currentHat = "tophat";
let savedHat = localStorage.getItem("hat");
let savedCache = localStorage.getItem("hatCache");

if (typeof savedHat !== "undefined" && savedHat !== null) {
    currentHat = savedHat;
}

export const hatCache = new Map<string, string>();

if (typeof savedCache !== "undefined" && savedCache !== null) {
    const obj = JSON.parse(savedCache);

    for (const key of Object.keys(obj)) {
        hatCache.set(key, obj[key]);
    }
}

/**
 * Get our current hat
 * @returns Hat ID
 */
export function getCurrentHat() {
    return currentHat;
}

export function getHatBaseURL(hatId: string) {
    return new URL(serverAddress + `/hat?id=${hatId}`);
}

/**
 * Hat ID to image data
 * @param hatId Hat ID
 * @returns Image blob
 */
export async function getHatImage(hatId: string) {
    // Fetch the image for the new hat
    // blob stuff didn't work out
    const url = new URL(serverAddress + `/hat?id=${hatId}`);
    return url;
    // const data = await fetch(url);

    // Turn it into readable data
    // return data.blob();
}

/**
 * Remove any given user's hat from DOM
 * @param userId MPP user ID
 * @returns undefined
 */
export function removeHat(userId: string) {
    // Get participant
    const part = Object.values(MPP.client.ppl).find(p => p._id == userId);
    if (!part) return;

    // Remove the user's hat
    $(part.nameDiv).children(".mpp-hat").remove();

    // Remove cursor hat
    $(part.cursorDiv)
        .children(".name")
        .children(".cursor-hat-conatiner")
        .remove();
}

/**
 * Add hat to any given user's name in DOM
 * @param userId MPP user ID
 * @param hatId Hat ID
 * @returns undefined
 */
export async function applyHat(userId: string, hatId: string) {
    // Add a hat to a participant
    if (typeof MPP.client.channel == "undefined") return;

    // Get participant
    const part = Object.values(MPP.client.ppl).find(p => p._id == userId);
    if (!part) return;

    // Create hat elements
    $(part.nameDiv).prepend(
        `<div class="mpp-hat" data-hat-id="${hatId}"></div>`
    );

    const cursorNameDiv = $(part.cursorDiv).children(".name");

    let cursorTagText = "";
    let cursorTagColor = "";
    let cursorNameText = $(part.cursorDiv).text();

    if ($(cursorNameDiv).children(".nametext").text().length !== 0) {
        cursorTagText = $(cursorNameDiv).children(".curtag").text();
        cursorTagColor = $(cursorNameDiv)
            .children(".curtag")
            .css("background-color");
        cursorNameText = $(cursorNameDiv).children(".nametext").text();
    }

    $(part.cursorDiv)
        .children(".name")
        .html(
            `<span class="nametext"></span><div class="cursor-hat-container"><div class="cursor-hat"></div></div>`
        ).find(".nametext").text(cursorNameText);

    if (cursorTagText.length !== 0) {
        $(part.cursorDiv)
            .children(".name")
            .prepend(
                `<span class="curtag" id="nametag-${part._id}" style="background-color: ${cursorTagColor};">${cursorTagText}</span>`
            );
    }

    // Force newer cursors on older clients
    $(part.cursorDiv).children(".name").css({
        display: "block",
        "align-items": "center",
        position: "relative",
        "white-space": "nowrap",
        height: "fit-content",
        width: "fit-content",
        "line-height": "15px",
        "text-align": "center",
        "border-radius": "3px",
        left: "18px",
        top: "12px",
        "pointer-events": "none",
        color: "#fff",
        padding: "unset",
        "font-size": "unset"
    });

    $(part.cursorDiv).children(".name").children("span.nametext").css({
        display: "inline-block",
        "pointer-events": "none",
        color: "#fff",
        "border-radius": "2px",
        "margin-bottom": "1px",
        "white-space": "nowrap",
        "flex-shrink": "0", // some idiot put this in the mppnet client css, there is no flex here
        "font-size": "10px"
    });

    const hat = $(part.nameDiv).children(".mpp-hat");
    const cursorHatContainer = $(part.cursorDiv)
        .children(".name")
        .children(".cursor-hat-container");
    const cursorHat = $(part.cursorDiv)
        .children(".name")
        .children(".cursor-hat-container")
        .children(".cursor-hat");

    hat.css({
        // background: `url(crown.png)`,
        background: `url(${serverAddress}/hat?id=${encodeURIComponent(hatId)})`,
        width: "16px",
        height: "16px",
        position: "absolute",
        top: "-8px",
        left: "4px"
    });

    cursorHatContainer.css({
        display: "inline-block",
        position: "relative",
        top: "-24px",
        right: "0",
        height: "0",
        width: "16px"
    });

    cursorHat.css({
        content: `url(${serverAddress}/hat?id=${encodeURIComponent(hatId)})`
    });

    if (typeof MPP.client.channel.crown == "object") {
        if (MPP.client.channel.crown.hasOwnProperty("userId")) {
            if (MPP.client.channel.crown.userId == userId) {
                hat.css({
                    top: "-8px",
                    left: "20px"
                });

                cursorHatContainer.css({
                    position: "absolute",
                    top: "-6px",
                    right: "17px"
                });
            }
        }
    }
}

/**
 * Remove given participant's hat and replace with a new one
 * @param userId MPP user ID
 * @param hatId Hat ID
 */
export async function setPartHat(userId: string, hatId: string) {
    // Set a participant's hat

    // Remove their current hat, if they have one
    removeHat(userId);

    // Add their new hat
    await applyHat(userId, hatId);

    // Save to cache
    hatCache.set(userId, hatId);

    let table: Record<string, string> = {};
    for (const [pid, hid] of hatCache.entries()) {
        table[pid] = hid;
    }

    localStorage.setItem("hatCache", JSON.stringify(table));
}

/**
 * Get a participant's hat
 * @param userId MPP user ID
 * @returns Hat ID
 */
export function getPartHat(userId: string) {
    // Get the part's hat ID and return it

    // If we have it cached, return that
    const cached = hatCache.get(userId);
    if (typeof cached !== "undefined") return cached;

    // Otherwise, ask them what hat they have
    if (queryLimit.spend()) customReply(userId, { m: "hat_query" });
}

/**
 * Remove a user's hat from cache
 * @param userId MPP user ID
 */
export async function uncachePartHat(userId: string) {
    hatCache.delete(userId);
}

/**
 * Change own current hat
 * @param id Hat ID
 * @returns undefined
 */
export async function changeHat(id: string) {
    // Set current hat

    // Get hat image
    // const image = getHatImage(id);
    // if (!image) return;

    // Set our own hat
    currentHat = id;
    localStorage.setItem("hat", getCurrentHat());
    setPartHat(MPP.client.getOwnParticipant()._id, id);

    // Tell everyone else what our hat is
    MPP.client.sendArray([
        {
            m: "custom",
            target: {
                mode: "subscribed"
            },
            data: {
                m: "hat_change",
                hat: getCurrentHat()
            }
        }
    ]);

    // Change button icon
    try {
        $("#mpp-hats-button-icon").attr(
            "src",
            getHatBaseURL(getCurrentHat()).toString()
        );
    } catch (err) { }
}

/**
 * Get list of available hats
 * @returns JSON array
 */
export async function getHatList() {
    // Get list of hats
    const data = await fetch(serverAddress + "/list");
    return (await data.json()) as any as Record<string, string>;
}
