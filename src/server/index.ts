import { join, resolve } from "path/posix";
import { exists, readFile } from "fs/promises";
import YAML from "yaml";

const jsonReply = (data: any, headers: any) => {
    return new Response(JSON.stringify(data), headers);
};

const assetsFolder = "./assets/";

const getHatImage = async (id: string) => {
    const path =
        resolve(assetsFolder) +
        "/" +
        encodeURIComponent(id).split("%2F").join("/").split(".").join("-") +
        ".png";
    // console.log(path);
    if (!(await exists(path))) throw new Error("invalid id");
    const data = Bun.file(path);
    return data;
};

const getHatList = async () => {
    const data = (await readFile("./hats.yml")).toString();
    const y = YAML.parse(data);
    return y;
};

Bun.serve({
    async fetch(req) {
        const url = new URL(req.url);

        const headers = new Headers();
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
        );

        if (url.pathname == "/hat") {
            const params = new URLSearchParams(url.search);
            if (!params.has("id")) return new Response("no id provided");
            const id = params.get("id");

            const image = await getHatImage(id as string);
            if (!image) return new Response("invalid id");
            return new Response(image, { headers });
        }

        if (url.pathname == "/list") {
            const list = await getHatList();
            return jsonReply(list, headers);
        }

        if (url.pathname == "/") {
            return jsonReply(
                {
                    uptime: process.uptime()
                },
                headers
            );
        }

        throw new Error("404 not found");
    },

    async error(err) {
        return new Response(err.toString());
    }
});
