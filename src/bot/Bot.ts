import type { IncomingEvents } from "mpp-client-net";
import type Client from "mpp-client-net";
import { EventEmitter } from "node:events";
import { Logger } from "~/util/Logger";

export class Bot extends EventEmitter {
    public logger = new Logger("MPP Bot");

    constructor(public cl: Client) {
        super();
        this.bindEventListeners();
    }

    /**
     * Send a hat query reply to a query-er
     * @param qid Query-er
     * @param uid User who is being queried
     * @param hat Hat that user is wearing
     **/
    public sendQueryReply(qid: string, uid: string, hat: string) {
        this.cl.sendArray([{
            m: "custom",
            target: {
                mode: "id",
                id: qid,
                global: true
            },
            data: {
                evtn: "query_reply",
                id: uid,
                hat
            }
        }]);
    }

    public changeHat(qid: string, hat: string) {
        // TODO: changeable hats
    }

    private alreadyBound = false;
    private bindEventListeners() {
        if (this.alreadyBound) return;
        this.alreadyBound = true;

        // MPP listeners
        this.cl.on("hi", msg => {
            if (typeof msg.motd !== "string") {
                this.logger.info("Connected to server");
            } else {
                this.logger.info(`Connected to server - ${msg.motd}`);
            }

            this.cl.sendArray([{ m: "+custom" }]);
        });

        let lastChannel = "";
        this.cl.on("ch", msg => {
            if (msg.ch._id === lastChannel) return;

            lastChannel = msg.ch._id;
            this.logger.info(`Connected to channel ${msg.ch._id}`);
        });

        this.cl.on("custom", msg => {
            if (typeof msg.data !== "object") return;
            if (!("m" in msg.data)) return;
            if (typeof msg.data.m !== "string") return;

            const type = msg.data.m;
            msg.data._p = msg.p;
            this.emit(type, msg);
        });

        // Bot events
        this.on("query", (msg: IncomingEvents['custom']) => {
            const id = msg.p;
        });
    }
}
