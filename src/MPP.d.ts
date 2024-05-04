import Client from "mpp-client-net";

declare interface IMPP {
    client: Client;

    piano: {
        play(): void;
        stop(): void;
    }

    soundSelector: {
        addPack(): void;
    }

    chat: {
        receive(msg: unknown): void;
        send(str: string): void;
    }
}

declare global {
    var MPP: IMPP;
}
