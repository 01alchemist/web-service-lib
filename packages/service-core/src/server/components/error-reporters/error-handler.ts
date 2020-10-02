import { Sentry } from "./sentry";
import * as SentryTypes from "@sentry/node";
import { logger } from "../logger";

type Scope = SentryTypes.Scope;

type BaseError = {
    reason?: any;
    code?: string;
} & Error;

export function reportError(error: BaseError, requestId: string = "[Not available]") {
    const { version, platform, arch } = process;
    const uptime = process.uptime();
    const {
        APP_VERSION = "",
        RELEASE: release = "",
        NODE_ENV: environment = "development",
        BUILD_ENV = ""
    } = process.env;

    const unknownReason = { message: "Unknown" };
    const { reason = unknownReason } = error;

    const extras = {
        reason,
        uptime,
        platform,
        arch,
        NodeJS: version,
        port: process.env.NODE_RUNTIME_PORT
    };

    const tags = {
        ...(error.code ? { error_code: error.code } : {})
    };

    if (environment === "development") {
        logger.error(error);
    } else {
        logger.error(error.message, {
            ...tags,
            ...extras,
            requestId,
            release,
            APP_VERSION,
            BUILD_ENV,
            environment,
            stack: error.stack,
            rawError: error
        });
    }

    Sentry.configureScope((scope: Scope) => {
        scope.setFingerprint([reason.message]);
        scope.setExtras(extras);
        scope.setTags(tags);
        Sentry.captureException(error);
    });
}
