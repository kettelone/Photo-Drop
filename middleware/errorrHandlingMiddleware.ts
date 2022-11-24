import { Response, Request, NextFunction } from 'express';
import AppError from '../errors/APIErrors';
// вызвав next() мы передает управление следуещему в цыпочке middleware

function customErrorHandler(err:AppError, req:Request, res:Response, next:NextFunction) {
  const { statusCode, message } = err;
  res.status(statusCode).json({ error: { message } });
  next();
}
export default customErrorHandler;
