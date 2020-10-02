/* tslint:disable import-name no-console function-name */
const dynamicRequire =
  typeof __non_webpack_require__ !== "undefined"
    ? __non_webpack_require__
    : require;
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const webpack = require("webpack");
const InjectPlugin = dynamicRequire("webpack-inject-plugin").default;
const SentryWebpackPlugin = require("@sentry/webpack-plugin");
const webpackNodeExternals = require("webpack-node-externals");
// const pnpUnpluggedExternals = require("webpack-pnp-unplugged-externals");
// const PnpWebpackPlugin = require("pnp-webpack-plugin");
// const PnpPackageJsonPlugin = require("pnp-package-json-webpack-plugin");

import { resolveTsPaths, generateBuildInfo, injectBuildInfo } from "./utils";

const { black, green, bgGreen } = chalk;
const { NODE_ENV = "development" } = process.env;

type WebpackConfigOptions = {
  baseDir: string;
  type: "service" | "library";
  entries: any;
  outDir?: string;
  pkg?: any;
  tsConfig?: any;
  externals?: string[];
};

const defaultExternals = [
  // pnpUnpluggedExternals(),
  webpackNodeExternals({
    allowlist: ["webpack/hot/poll?1000"],
  }),
  /^(@01\/)/i,
  /^(.yarn\/)/i,
];

export const WebpackNodeConfig = ({
  baseDir,
  entries,
  type,
  pkg: _pkg,
  tsConfig: _tsConfig,
  outDir = "dist",
  externals = defaultExternals,
}: WebpackConfigOptions) => {
  const pkg: any =
    _pkg || dynamicRequire(path.resolve(baseDir, "package.json"));
  const tsConfig: any =
    _tsConfig || dynamicRequire(path.resolve(baseDir, "tsconfig.json"));

  console.log(
    `Webpack build ${green("NODE_ENV")} 👉 ${bgGreen(` ${black(NODE_ENV)} `)}`
  );
  const mode = NODE_ENV === "production" ? "production" : "development";
  const resolvedTsPaths = resolveTsPaths(tsConfig, baseDir);
  console.log("TypeScript resolved paths");
  console.log("👇");
  console.log(resolvedTsPaths);

  fs.removeSync(path.resolve(baseDir, outDir));

  const buildInfo = generateBuildInfo(pkg);
  const { branch, release } = buildInfo;
  const isDevOrMaster = branch === "develop" || branch === "master";
  // const { name, version, main, engines } = pkg;
  // const basePackageValues = {
  //   name,
  //   version,
  //   main,
  //   engines,
  // };
  return {
    mode,
    target: "node",
    stats: {
      warnings: false,
    },
    node: {
      __dirname: false,
      __filename: false,
    },
    context: baseDir,
    entry: entries,
    externals,
    devtool: "inline-source-map",
    optimization: {
      minimize: false,
      nodeEnv: false,
    },
    resolve: {
      mainFields: ["main", "module"],
      extensions: [".ts", ".js", ".graphql", ".gql"],
      alias: {
        ...resolvedTsPaths,
      },
      // plugins: [PnpWebpackPlugin],
    },
    plugins: [
      // new PnpPackageJsonPlugin({
      //   basePackageValues,
      // }),
      new InjectPlugin(() => injectBuildInfo(type, buildInfo)),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.NamedModulesPlugin(),
      isDevOrMaster &&
        new SentryWebpackPlugin({
          release,
          include: baseDir,
          ignoreFile: ".sentrycliignore",
          ignore: ["node_modules", "webpack.config.js", "coverage", "tests"],
          configFile: "sentry.properties",
          urlPrefix: baseDir,
          finalize: false,
        }),
    ].filter((plugin) => plugin),
    module: {
      rules: [
        {
          test: /\.node$/,
          loader: require.resolve("node-loader"),
        },
        {
          test: /\.tsx?$/,
          loader: require.resolve("ts-loader"),
          exclude: /(node_modules|.yarn)/,
        },
        {
          test: /\.pnp.js?$/,
          loader: require.resolve("shebang-loader"),
          exclude: /(node_modules|.yarn)/,
        },
        {
          enforce: "pre",
          test: /\.(ts)$/,
          loader: require.resolve("eslint-loader"),
          exclude: /(node_modules|.yarn)/,
          options: {
            emitErrors: true,
          },
        },
        {
          test: /\.(graphql|gql)$/,
          exclude: /(node_modules|.yarn)/,
          loader: require.resolve("graphql-tag/loader"),
        },
      ],
    },
    output: {
      filename: "[name].js",
      path: path.resolve(baseDir, outDir),
      devtoolModuleFilenameTemplate(info: any) {
        return path.resolve(baseDir, encodeURI(info.resourcePath));
      },
      library: "[name]",
      libraryTarget: "umd",
    },
  };
};
