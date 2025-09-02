import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import * as pkg from "../package.json";

const outdir = "./build";
const targetName = "mpp-hats";

const buildDate = `// Build date: ${new Date().toISOString()}\n`;

const placeholders: Record<string, string> = {
    $NAME: pkg.name,
    $VERSION: pkg.version
};

console.log("Building...");

const result = await Bun.build({
    entrypoints: ["./src/index.ts"],
    target: "browser",
    minify: true,
    outdir
});

console.log(result.logs.join("\n"));

if (!result.success) {
    console.log("Build failed!");
    process.exit(1);
}

console.log("Bundling header...");

let header = readFileSync("scripts/header.js").toString();

for (const placeholder of Object.keys(placeholders)) {
    header = header.split(placeholder).join(placeholders[placeholder]);
}

const script = readFileSync(join(outdir, "index.js"));
writeFileSync(
    join(outdir, targetName + ".user.js"),
    header + buildDate + script
);

console.log("Done");
