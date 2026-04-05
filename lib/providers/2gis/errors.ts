export type TwoGisErrorCode =
  | "MISSING_API_KEY"
  | "INVALID_RESPONSE"
  | "UPSTREAM_ERROR"
  | "TIMEOUT"
  | "NETWORK";

export class TwoGisClientError extends Error {
  readonly code: TwoGisErrorCode;

  readonly httpStatus?: number;

  readonly meta?: unknown;

  constructor(
    code: TwoGisErrorCode,
    message: string,
    options?: { cause?: unknown; httpStatus?: number; meta?: unknown },
  ) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "TwoGisClientError";
    this.code = code;
    this.httpStatus = options?.httpStatus;
    this.meta = options?.meta;
  }
}
