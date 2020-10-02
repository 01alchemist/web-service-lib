/**
 * Created by n.vinayakan on 04.08.17.
 */
export class RequestError {
    constructor(public code: number,
                public name: string,
                public message: string) {
    }
}

export class RequestWarn {
    constructor(public name: string,
                public message: string) {
    }
}

export const HttpStatus = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};
