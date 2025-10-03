// scripts/bump-version.mjs
import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("./package.json","utf8"));
const v = pkg.version.split(".").map(Number);
v[2]++; pkg.version = v.join(".");
fs.writeFileSync("./package.json", JSON.stringify(pkg,null,2));
console.log("bumped to", pkg.version);
