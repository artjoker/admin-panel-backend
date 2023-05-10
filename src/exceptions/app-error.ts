import { ValidationError } from 'class-validator';

export enum HttpCode {
  OK = 200,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

interface AppErrorArgs {
  name?: string;
  httpCode: HttpCode;
  description: string;
  validationErrors?: ValidationError[];
  /**
   * The isOperational property is what determines if this error is a serious mistake.
   * Setting it to true means that the error is normal and the user
   * should receive an explanation what caused it.
   */
  isOperational?: boolean;
}

export class AppError extends Error {
  public readonly name: string;
  public readonly httpCode: HttpCode;
  public readonly validationErrors: ValidationError[];
  public readonly isOperational: boolean = true;

  constructor(args: AppErrorArgs) {
    super(args.description);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = args.name || 'Error';
    this.httpCode = args.httpCode;
    this.validationErrors = args.validationErrors || [];

    if (args.isOperational !== undefined) {
      this.isOperational = args.isOperational;
    }

    Error.captureStackTrace(this);
  }
}
