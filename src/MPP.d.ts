import Client from "mpp-client-net";

declare interface IMPP {
    client: Client;

    piano: {
        play(): void;
        stop(): void;
    };

    soundSelector: {
        addPack(): void;
    };

    chat: {
        receive(msg: unknown): void;
        send(str: string): void;
        blur(): void;
    };

    modal: {
        openModal(selector: string, focus?: any): void;
        closeModal(): void;
    }
}

declare global {
    var MPP: IMPP;
}
