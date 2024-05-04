import { join, resolve } from "path/posix";
import { exists, readdir } from "fs/promises";

const jsonReply = (data: any) => {
    return new Response(JSON.stringify(data));
};

const assetsFolder = "./assets/";

const getHatImage = async (id: string) => {
    const path =
        resolve(assetsFolder) +
        "/" +
        encodeURIComponent(id).split("%2F").join("/").split(".").join("-") +
        ".png";
    console.log(path);
    if (!(await exists(path))) throw new Error("invalid id");
    const data = Bun.file(path);
    return data;
};

const getHatList = async () => {
    return await readdir(resolve(assetsFolder));
};

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

        if (url.pathname == "/list") {
            const list = await getHatList();
            return jsonReply(list);
        }

        if (url.pathname == "/") {
            return jsonReply({
                uptime: process.uptime()
            });
        }

        throw new Error("404 not found");
    },

    async error(err) {
        return new Response(err.toString());
    }
});
