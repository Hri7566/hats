# MPP Hats

Script for wearing hats on [MPP.net](https://multiplayerpiano.net).

## How to install

First, if you don't already have one, install a userscript manager.

Usually, people use [Violentmonkey](https://violentmonkey.github.io/) or [Tampermonkey](https://www.tampermonkey.net/) to manage userscripts.

If you're unsure what a userscript manager is, it's a browser extension that can run custom code on websites. Most people who create scripts for MPP.net use userscripts.

Then, to get the script, it can be found [here](https://github.com/Hri7566/hats/releases/latest/download/mpp-hats.user.js).

## For developers

This project uses bun to compile the code into a single userscript.

### How to build the script

First, install dependencies:

```bash
bun install
```

Then bundle the script:

```bash
bun scripts/build.ts
```
