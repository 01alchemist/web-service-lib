const path = require("path");
const cwd = process.cwd();
const TS_NODE_PROJECT = path.resolve(cwd, "tsconfig.json");
process.env.TS_NODE_PROJECT = TS_NODE_PROJECT;
process.env.TS_NODE_TRANSPILE_ONLY = true;
require("ts-node").register({});
process.argv.push("--color");
require("webpack-cli");
