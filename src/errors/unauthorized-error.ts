import { CustomError } from "./custom-error";

export class UnAuthorizedError extends CustomError {
  statusCode: number = 401;
  constructor() {
    super("UnAuthorizedError");
    Object.setPrototypeOf(this, UnAuthorizedError.prototype);
  }
  serializeErrors(): { message: string; field?: string | undefined }[] {
    return [{ message: "Not authorized." }];
  }
}
