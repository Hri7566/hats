export const serverAddress = "https://hats.hri7566.info/api";

let currentHat = "cat";

let savedHat = localStorage.getItem("hat");

if (typeof savedHat !== "undefined" && savedHat !== null) {
    currentHat = savedHat;
}

/**
 * Get our current hat
 * @returns Hat ID
 */
export function getCurrentHat() {
    return currentHat;
}

/**
 * Hat ID to image data
 * @param hatId Hat ID
 * @returns Image blob
 */
export async function getHatImage(hatId: string) {
    // Fetch the image for the new hat
    const url = new URL(serverAddress + `/hat?id=${hatId}`);
    const data = await fetch(url);

    // Turn it into readable data
    return data.blob();
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

    // Create hat element
    $(part.nameDiv).prepend(
        `<div class="mpp-hat" data-hat-id="${hatId}"></div>`
    );

    const hat = $(part.nameDiv).children(".mpp-hat");

    hat.css({
        // background: `url(crown.png)`,
        background: `url(${serverAddress}/hat?id=${encodeURIComponent(hatId)})`,
        width: "16px",
        height: "16px",
        position: "absolute",
        top: "-8px",
        left: "4px"
    });

    if (MPP.client.channel.crown.userId == userId) {
        hat.css({
            top: "-8px",
            left: "20px"
        });
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
}

/**
 * Change own current hat
 * @param id Hat ID
 * @returns undefined
 */
export async function changeHat(id: string) {
    // Set current hat

    // Get hat image
    const image = getHatImage(id);
    if (!image) return;

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
}
