import { Request, Response, NextFunction } from 'express';

import { ErrorHandler } from '../exceptions';

type ErrorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

const errorHandler: ErrorMiddleware = (err, _req, res, _next) => {
  ErrorHandler.handleError(err, res);
};

export default errorHandler;
