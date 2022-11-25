import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import APIError from '../errors/APIError';

function checkAuth(req: Request, res: Response, next: NextFunction) {
  // if (req.method === 'OPTIONS') {
  //   next();
  // }
  try {
    if (req.headers.authorization !== undefined) {
      const token = req.headers.authorization.split(' ')[1]; // Bearer ddhcjhdsjcsdcs

      if (!token) {
        next(APIError.unauthorized('Not authorized'));
        return;
      }

      jwt.verify(token, process.env.SECRET_KEY!);

      next();
    } else {
      next(APIError.unauthorized('Missing authorization token'));
      return;
    }
  } catch (e) {
    next(APIError.unauthorized('Not authorized'));
  }
}

export default checkAuth;
