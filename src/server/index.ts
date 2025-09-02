import { resolve } from "path/posix";
import { exists, readFile, readdir } from "fs/promises";
import YAML from "yaml";

const jsonReply = (data: any) => {
    const res = new Response(JSON.stringify(data));
    res.headers.set("Access-Control-Allow-Origin", "*");
    return res;
};

const assetsFolder = "./assets/";

async function getHatImage(id: string) {
    const fileList = await readdir(resolve(assetsFolder));
    const defangedId = encodeURIComponent(id)
        .split("%2F")
        .join("/")
        .split(".")
        .join("-");

    let foundFile;
    let foundFileExt;

    for (const file of fileList) {
        const parsed = file.split(".");

        const filename = parsed[0];
        if (!filename) continue;

        if (defangedId == "crown") {
            foundFile = "crown";
            foundFileExt = "png";
        } else if (defangedId == "party") {
            foundFile = "party";
            foundFileExt = "png";
        } else if (defangedId == "party_hat") {
            foundFile = "party_hat";
            foundFileExt = "png";
        } else {
            if (filename.startsWith(defangedId)) {
                foundFile = filename;
                foundFileExt = parsed[1];
            }
        }
    }

    if (!foundFile) throw new Error("invalid id");
    if (!foundFileExt) throw new Error("invalid server file");

    const path = resolve(assetsFolder) + "/" + foundFile + "." + foundFileExt;
    if (!(await exists(path))) throw new Error("invalid id");

    const data = Bun.file(path);

    return data;
}

async function getHatList() {
    const data = (await readFile("./hats.yml")).toString();
    const y = YAML.parse(data);

    return y;
}

const server = Bun.serve({
    async fetch(req) {
        const url = new URL(req.url);

        const headers = new Headers();
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Age", "1");
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

            const res = new Response(image);

            res.headers.set("Access-Control-Allow-Origin", "*");
            res.headers.set(
                "Access-Control-Allow-Methods",
                "GET, POST, PUT, DELETE, OPTIONS"
            );

            return res;
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

console.log(`Server started on ${server.hostname}:${server.port}`);
