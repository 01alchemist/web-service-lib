import * as express from "express";
import { doSecurityCheck } from "../security";
import { BaseError, reportError, Sentry } from "../error-reporters";
import { RequestStatus, RequestReceipt } from "../lambda";
import { performance } from "perf_hooks";
import { env } from "@01/env";
import { logger } from "../logger";
import { profile } from "../profiler";

const isDevelopmentEnv = env("NODE_ENV") === "development";

export const SEPARATOR = "::";

type AutoMethodParameters = {
  tags?: string[];
  private?: boolean;
  responses?: any;
  parameters?: any;
};

type RequestHandler = ((
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => Promise<RequestReceipt>) &
  AutoMethodParameters;

const routeMap: Map<string, RequestHandler> = new Map();
const methods = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "options",
  "all",
] as const;
type RestApiMethods = Partial<
  { [K in typeof methods[number]]: RequestHandler }
>;

export interface IRestApiRoute extends RestApiMethods {
  new (): IRestApiRoute;
}
export abstract class RestApiRoute implements RestApiMethods {
  constructor() {}
}

type AutoRouteParameters = {
  path: string;
};

const router = express.Router();

/**
 * AutoRoute is a class decorator which will register the api for swagger
 * @param params
 */
export const AutoRoute = (params: AutoRouteParameters): any => {
  return (RouteClass: IRestApiRoute) => {
    /**
     * RouteClass is the resource class which contains REST api methods like
     * get, post, put, delete etc..
     */
    const route = new RouteClass();
    /**
     * Iterate over each REST api methods and register corresponding express
     * routes
     */
    methods.forEach((method) => {
      let restApiMethod = route[method];
      if (restApiMethod) {
        restApiMethod = profile(restApiMethod);
        const routeKey = `${method}${SEPARATOR}${params.path}`;
        const existingRoute = routeMap.get(routeKey);
        if (existingRoute) {
          routeMap.set(routeKey, restApiMethod);
          logger.info(
            `ROUTE REPLACED ${params.path} => ${route.constructor.name}.${method}`
          );
        } else {
          logger.info(
            `ROUTE REGISTRED ${params.path} => ${route.constructor.name}.${method}`
          );

          routeMap.set(routeKey, restApiMethod);

          // Register request handler to express router
          router[method](
            params.path,
            async (
              req: express.Request,
              res: express.Response,
              next: express.NextFunction
            ) => {
              const method = req.method.toLowerCase();
              const routeKey = `${method}${SEPARATOR}${params.path}`;
              const protocol = req.headers["x-forwarded-proto"] || req.protocol;
              const startTime = performance.now();
              const requestHandler = routeMap.get(routeKey);
              if (requestHandler) {
                console.log(
                  "----> requestHandler.private:",
                  requestHandler.private
                );
                if (requestHandler.private) {
                  const isSecurityCheckPassed = await doSecurityCheck(req, res);
                  console.log(
                    "----> isSecurityCheckPassed:",
                    isSecurityCheckPassed
                  );
                  if (!isSecurityCheckPassed) {
                    return;
                  }
                }
                try {
                  const receipt: RequestReceipt = await requestHandler(
                    req,
                    res,
                    next
                  );
                  if (receipt?.status === RequestStatus.SUCCESS_WITH_WARNING) {
                    Sentry.captureMessage(
                      receipt.message,
                      Sentry.Severity.Warning
                    );
                  }
                } catch (e) {
                  // We don't want to cache errors
                  res.header("Cache-Control", `max-age=0`);
                  const error = (await e) as BaseError;
                  reportError(error);
                  res.status(error.code ? parseInt(error.code as string) : 500).json({
                    status: false,
                    error:
                      (error.response && error.response.error) ||
                      error.message ||
                      "Unknown error",
                  });
                }
              } else {
                res.header("Cache-Control", `max-age=0`);
                res.status(404).json({
                  status: false,
                  error: `Request handler not found for [${method}]:${params.path}`,
                });
              }
              const endTime = performance.now();

              if (isDevelopmentEnv) {
                logger.info(
                  `PATH -> [${protocol}] ${req.path} [${endTime - startTime}ms]`
                );
                if (req["queryStringParameters"]) {
                  logger.info(req["queryStringParameters"]);
                }
              }
            }
          );
        }
      }
    });
  };
};

export const AutoMethod = (params: AutoMethodParameters): any => {
  return function (parent: RequestHandler, key: string) {
    parent[key].tags = params.tags;
    parent[key].private = !!params.private;
    parent[key].responses = params.responses;
    parent[key].parameters = params.parameters;
  };
};

export function getRouter() {
  return router;
}

export function getRoutes() {
  return routeMap;
}

export const AutoRouter = {
  getRouter,
  getRoutes,
};

if (module["hot"]) {
  module["hot"].dispose(() => {
    logger.info("Disposed AutoRoute");
    router.stack.splice(0, router.stack.length);
  });
}
