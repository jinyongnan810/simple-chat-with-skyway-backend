import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  statusCode: number = 404;
  constructor() {
    super("Not-found error occurred.");
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
  serializeErrors(): { message: string; field?: string | undefined }[] {
    return [{ message: "The path does not exist." }];
  }
}
