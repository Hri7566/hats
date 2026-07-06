import { Client } from "mpp-client-net";

const cl = new Client("wss://backend.multiplayerpiano.net:443", process.env.MPPNET_TOKEN);

cl.start();
