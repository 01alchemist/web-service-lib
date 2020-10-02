import sourceMap from "source-map-support";
sourceMap.install();
import { env, envInt } from "@01/env";
process.env.APP_TRACE_NAME = env("APP_NAME", "") + "-web";

import * as fs from "fs";
import * as ngrok from "ngrok";
import { logVar } from "./utils";
import { Express } from "express";
import app from "./app";
import { Server } from "http";
import { AddressInfo } from "net";

const nodeEnv = env("NODE_ENV", "development");
process.env.NODE_ENV = nodeEnv;

const isDev = env("NODE_ENV", "development") === "development";
logVar("NODE_ENV:", nodeEnv);
const port =
  envInt("npm_package_config_api_port") ||
  envInt("NODE_PORT") ||
  envInt("PORT") ||
  3000;
const host = "0.0.0.0";
process.env.NODE_RUNTIME_PORT = port.toString();
let prevAppInstance: Express;
let prevServer: Server;

console.log("Port:" + port);

export class ExpressServer {
  constructor() {
    this.init();
  }
  async init() {
    const appInstance = await app.create();
    prevAppInstance = appInstance;
    appInstance.set("port", port);
    startServer(appInstance);
  }
  get app() {
    return prevAppInstance;
  }
  get server() {
    return prevServer;
  }
}

function startServer(appInstance: Express) {
  console.log("Starting http(s) server...");
  // Listen the server
  prevServer = appInstance.listen(port, host, async () => {
    const addressInfo: AddressInfo = prevServer.address() as AddressInfo;
    const host = addressInfo.address;
    if (process.env.DYNO) {
      console.log("This is on Heroku..!!");
      fs.openSync("/tmp/app-initialized", "w");
    }
    console.log("\n ✈️ Express server listening at %s:%s", host, port);
    if (isDev) {
      try {
        const ngrokAuthToken = env("NGROK_TOKEN");
        await ngrok.authtoken(ngrokAuthToken);
        const url = await ngrok.connect(port);
        console.log("|###################################################|");
        console.log("|                                                   |");
        console.log("|        COPY & PASTE NGROK URL BELOW:              |");
        console.log("|                                                   |");
        console.log("|          " + url + "                |");
        console.log("|                                                   |");
        console.log("|###################################################|");

        console.log("=====");
        console.log(
          "Visit the Actions on Google console at http://console.actions.google.com"
        );
        console.log("Replace the webhook URL in the Actions section with:");
        console.log("    " + url + "/smarthome");

        console.log("In the console, set the Authorization URL to:");
        console.log("    " + url + "/oauth");

        console.log("");
        console.log("Then set the Token URL to:");
        console.log("    " + url + "/token");
        console.log("");

        console.log("Finally press the 'TEST DRAFT' button");
      } catch (e) {
        console.log("ngrok error", e);
      }
    }
  });
  return prevServer;
}

manageSockets(prevServer);

// TCP Socket keeper
let sockets = new Map();
let nextSocketId = 0;
function manageSockets(server) {
  server.on("connection", (socket) => {
    const socketId = nextSocketId++;
    sockets.set(socketId, socket);
    socket.on("close", () => {
      sockets.delete(socketId);
    });
  });
}

function closeAllConnections() {
  sockets.forEach((socket, socketId) => {
    try {
      socket.destroy();
    } catch (e) {
      console.log(e);
    }
  });
  sockets.clear();
}

if (isDev) {
  if (module["hot"]) {
    module["hot"].accept("./app", function () {
      console.log("app.ts updated");
      console.log("Closing old http sever...");

      prevServer.close(() => {
        console.log("Old http sever closed");
        if (prevAppInstance !== null) {
          prevAppInstance = null;
        }
        let app = require("./app").default;
        app.create().then((appInstance) => {
          prevAppInstance = appInstance;
          appInstance.set("port", port);

          // Listen the server
          prevServer = appInstance.listen(port, host, function () {
            console.log(`\n ✈️  Express server reloaded on port ${port}\n`);
          });
          manageSockets(prevServer);
        });
      });
      closeAllConnections();
    });
  }
}
