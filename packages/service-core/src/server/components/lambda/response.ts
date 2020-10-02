import { Response } from "express";
import { RequestReceipt, RequestStatus } from "./request";

export type LambdaResponse<T> = {
  statusCode?: number;
  headers?: { [key: string]: string };
  body: string | Buffer | T;
  warning?: string;
};

export function sendLambdaResponse<T>(res: Response, response: LambdaResponse<T>): RequestReceipt {
  const { statusCode } = response;
  res.set({ ...response.headers });
  res.status(statusCode).json(response.body);
  const status =
    statusCode === 500
      ? RequestStatus.FAILED
      : response.warning
      ? RequestStatus.SUCCESS_WITH_WARNING
      : RequestStatus.SUCCESS;
  return { status, message: response.warning };
}
