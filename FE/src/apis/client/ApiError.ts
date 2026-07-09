export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly raw?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
