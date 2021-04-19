import { CustomError } from "./custom-error";

export class BadRequestError extends CustomError {
  statusCode: number = 400;
  constructor(public msg: string = "") {
    super(msg || "Bad request error occurred.");
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
  serializeErrors(): { message: string; field?: string | undefined }[] {
    return [{ message: this.msg }];
  }
}
