import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import ApiError from '../errors/APIErrors';

function checkAuth(req: Request, res: Response, next: NextFunction) {
  // if (req.method === 'OPTIONS') {
  //   next();
  // }
  try {
    if (req.headers.authorization !== undefined) {
      const token = req.headers.authorization.split(' ')[1]; // Bearer ddhcjhdsjcsdcs

      if (!token) {
        next(new ApiError(401, 'Not authorized'));
      }

      jwt.verify(token, process.env.SECRET_KEY!);

      next();
    } else {
      next(new ApiError(401, 'Missing authorization token'));
    }
  } catch (e) {
    next(new ApiError(401, 'Not authorized'));
  }
}

export default checkAuth;
