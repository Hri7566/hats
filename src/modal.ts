let gModal: any;

export function modalHandleEsc(evt: any) {
    if (evt.key == "Escape") {
        closeModal();
        // Stop chat from opening, since we're not part of script.js
        if (MPP.chat) MPP.chat.blur();
    }
}

export function openModal(selector: string, focus?: any) {
    if (MPP.chat) MPP.chat.blur();
    $(document).on("keydown", modalHandleEsc);
    $("#modal #modals > *").hide();
    $("#modal").fadeIn(250);
    $(selector).show();
    setTimeout(() => {
        $(selector).find(focus).focus();
    }, 100);
    gModal = selector;
}

export function closeModal() {
    $(document).off("keydown", modalHandleEsc);
    $("#modal").fadeOut(100);
    $("#modal #modals > *").hide();
    gModal = null;
}
