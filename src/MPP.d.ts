import Client from "mpp-client-net";

declare global {
    var MPP: {
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
        };
    };
}
