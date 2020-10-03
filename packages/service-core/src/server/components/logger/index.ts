import chalk from "chalk";
import {
  createLogger as createLoggerInternal,
  format,
  transports,
} from "winston";

/**
 * Return custom console logger in development environment.
 * This will paint info, warn and error with distinct bg colors.
 * Also remove graphql query from request body since it's too long and noisy
 */
const isDev = process.env.NODE_ENV === "development";
const gray = chalk.bgGray;
const blue = chalk.bgBlue;
const red = chalk.bgRed;
const orange = chalk.bgHex("#FF5E13");
const colorMap = {
  log: gray,
  info: blue,
  warn: orange,
  error: red,
};
const consoleProxy = new Proxy(console, {
  get(target, property: string) {
    return (data, metadata) => {
      let meta = metadata;
      try {
        meta = JSON.parse(metadata);
      } catch (e) {}
      const c = colorMap[property];
      if (meta && meta.body && meta.body.query) {
        meta.body.query = "~~removed bcoz it's too long~~";
      }
      target[property](`${c(` ${property} `)} `, data, ...(meta ? [meta] : []));
    };
  },
});

export const createLogger = (options = {}) =>
  isDev
    ? consoleProxy
    : createLoggerInternal({
        transports: new transports.Console(
          Object.assign(
            {
              // default options
              level: "info",
              timestamp: true,
              colorize: false,
            },
            options
          )
        ),
        defaultMeta: { env: process.env.NODE_ENV },
        format:
          process.env.NODE_ENV !== "development"
            ? format.combine(format.timestamp(), format.json())
            : format.combine(format.colorize(), format.simple()),
      });

export const logger = createLogger();
