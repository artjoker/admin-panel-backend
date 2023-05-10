import { Response } from 'express';
import { AppError, HttpCode } from './app-error';

class ErrorHandler {
  private static isTrustedError(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }

    return false;
  }

  public static handleError(error: Error | AppError, response: Response): void {
    console.error(error);
    if (this.isTrustedError(error)) {
      this.handleTrustedError(error as AppError, response);
    } else {
      this.handleCriticalError(error, response);
    }
  }

  private static handleTrustedError(error: AppError, response: Response): void {
    response.status(error.httpCode).json({
      message: error.message,
      validationErrors: error.validationErrors,
    });
  }

  private static handleCriticalError(
    error: Error | AppError,
    response: Response
  ): void {
    response
      .status(HttpCode.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error', error });
  }
}

export default ErrorHandler;
