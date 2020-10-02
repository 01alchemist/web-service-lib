import { WebpackNodeConfig } from "./src/webpack-config";

const entries = {
  index: ["./src/index.ts"],
};

const baseDir = __dirname;
export const defaultWebpackNodeConfig = WebpackNodeConfig({
  baseDir,
  entries,
  type: "library",
  externals: [],
});
export default defaultWebpackNodeConfig;
