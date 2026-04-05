export type AnalysisErrorCode =
  | "GRID_TOO_HEAVY"
  | "CELL_SIZE_INVALID"
  | "RADIUS_INVALID"
  | "BBOX_INVALID"
  | "BBOX_TOO_SMALL"
  | "BBOX_TOO_LARGE"
  | "PROVIDER_UNSUPPORTED";

export class AnalysisValidationError extends Error {
  readonly code: AnalysisErrorCode;

  constructor(code: AnalysisErrorCode, message: string) {
    super(message);
    this.name = "AnalysisValidationError";
    this.code = code;
  }
}
