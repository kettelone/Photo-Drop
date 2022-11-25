import { NextFunction, Request, Response } from 'express';
import APIError from '../errors/APIError';

function apiErrorHandler(err: Error, req: Request, res:Response, next:NextFunction) {
  // in prod do not use console.log or console.err because it is not async
  console.log(err);

  if (err instanceof APIError) {
    res.status(err.code).json(err.message);
    return;
  }

  res.status(500).json('Generic server error');
}

export default apiErrorHandler;
