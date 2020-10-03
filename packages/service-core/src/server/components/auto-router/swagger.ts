import * as express from "express";
import { middleware as OpenApiValidatorMiddleware } from "express-openapi-validator";
import { AutoRouter, AutoRoute, AutoMethod } from "./auto-router";
import { envInt } from "@01/env";
import { inspect } from "util";
let openApiSchema;

/**
 * OpenAPI doc route
 */
@AutoRoute({
  path: "/api-docs",
})
export class ApiDocs {
  @AutoMethod({
    private: true,
    tags: ["api-docs"],
  })
  async get(_, res) {
    res.set("Access-Control-Allow-Origin", "*");
    res.json(openApiSchema);
  }
}

const defaultResponse = {
  "3": {
    "200": {
      description: "200 response",
      content: {
        "application/json": {
          schema: { type: "object" },
        },
      },
    },
  },
};

const schemaCatelog = {
  "3": {
    openapi: "3.0.0",
    info: {
      version: process.env.APP_VERSION || "0.0.1",
      title: process.env.APP_NAME || "AutoRouter Web API",
    },
    servers: [
      {
        url: process.env.API_URL_DEV || "http://localhost:8081",
      },
    ],
    tags: [{ name: "default" }],
    paths: {},
  },
};

type SwaggerOptions = {
  app: express.Express;
  basePath?: string;
};
async function initialize({ app, basePath = "/api" }: SwaggerOptions) {
  const swaggerVersion = "3";
  const schema = schemaCatelog[swaggerVersion];
  const tags: Set<string> = new Set();
  const routes = AutoRouter.getRoutes();
  const controllers = {};
  let routeCount = 0;
  routes.forEach((route, key) => {
    if (route.tags) route.tags.forEach((tag) => tags.add(tag));
    const fragments = key.split(":");
    const operationId = `Operation_${++routeCount}`;
    const path = fragments[1];
    const absolutePath = `${basePath}${path}`;
    schema.paths[absolutePath] = {
      [fragments[0]]: {
        operationId,
        tags: route.tags || [],
        parameters: route.parameters || [],
        responses: route.responses || defaultResponse[swaggerVersion],
      },
    };
    controllers[operationId] = route;
  });
  const _tags = Array.from(tags).map((tag) => ({
    name: tag,
  }));
  schema.tags = _tags ? _tags : [];
  openApiSchema = schema;
  const openApiRouter = AutoRouter.getRouter();
  console.log(inspect(schema, { colors: true, depth: null }));

  // Install open api validator middleware
  app.use(
    OpenApiValidatorMiddleware({
      apiSpec: schema,
      validateRequests: true,
      validateResponses: true,
    })
  );

  // tslint:disable-next-line: ter-prefer-arrow-callback
  const routerWrapper = async (_, res, next) => {
    try {
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      const MAX_AGE_API = envInt("MAX_AGE_API", 0);
      if (MAX_AGE_API) {
        res.header("Cache-Control", `max-age=${MAX_AGE_API}`);
      }
      next();
    } catch (e) {
      next(e);
    }
  };
  app.use(basePath ? basePath : "*", routerWrapper, openApiRouter);
}

type RegisterComponentOptions = {
  name: string;
  component: any;
  type?: string;
  version?: string;
};
function registerComponent({
  name,
  component,
  type = "schemas",
  version = "3",
}: RegisterComponentOptions) {
  const schema = schemaCatelog[version];
  schema.components = schema.components || {};
  schema.components[type] = schema.components[type] || {};
  schema.components[type][name] = component;
}

export const swagger = {
  register: initialize,
  registerComponent,
};
