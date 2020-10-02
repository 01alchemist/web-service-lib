type QueryParameters = {
  [key: string]: string;
};

export enum RequestStatus {
  SUCCESS,
  SUCCESS_WITH_WARNING,
  FAILED
}

export type RequestReceipt = {
  status: RequestStatus;
  message: string;
};

export function lambdaRequest(req: { query: QueryParameters; queryStringParameters?: QueryParameters }) {
  req.queryStringParameters = req.query;
  return req;
}
