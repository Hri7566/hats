import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const outdir = "./build";
const targetName = "mpp-hats";

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

const buildDate = `// Build date: ${new Date().toISOString()}\n`;

const header = readFileSync("scripts/header.js").toString();
const script = readFileSync(join(outdir, "index.js"));
writeFileSync(
    join(outdir, targetName + ".user.js"),
    header + buildDate + script
);

console.log("Done");
