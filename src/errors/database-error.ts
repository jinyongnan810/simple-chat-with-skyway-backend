import { CustomError } from "./custom-error";

export class DatabaseAccessError extends CustomError {
  statusCode: number = 500;
  constructor(public message: string) {
    super("Database error occurred.");
    Object.setPrototypeOf(this, DatabaseAccessError.prototype);
  }
  serializeErrors(): { message: string; field?: string | undefined }[] {
    return [{ message: this.message }];
  }
}
