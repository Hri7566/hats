import { join, resolve } from "path/posix";
import { exists } from "fs/promises";

const apiReply = (data: any) => {
    return new Response(data);
};

const getHatImage = async (id: string) => {
    const path = resolve(assetsFolder, id + ".png");
    if (!(await exists(path))) throw new Error("invalid id");
    const data = Bun.file(path);
    return data;
};

const assetsFolder = "./assets/";

Bun.serve({
    async fetch(req) {
        const url = new URL(req.url);

        if (url.pathname == "/hat") {
            const params = new URLSearchParams(url.search);
            if (!params.has("id")) return new Response("no id provided");
            const id = params.get("id");

            const image = await getHatImage(id as string);
            if (!image) return new Response("invalid id");
            return new Response(image);
        }

        return apiReply({
            uptime: process.uptime()
        });
    },

    async error(err) {
        return apiReply(err);
    }
});
