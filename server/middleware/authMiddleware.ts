import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

function checkAuth(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'OPTIONS') {
    next();
  }

  try {
    if (req.headers.authorization !== undefined) {
      const token = req.headers.authorization.split(' ')[1]; // Bearer ddhcjhdsjcsdcs

      if (!token) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      const decoded = jwt.verify(token, process.env.SECRET_KEY!);

      console.log('decoded info is: ', decoded);

      next();
    } else {
      return res.status(401).json({ message: 'Missing authorization token' });
    }
  } catch (e) {
    res.status(401).json({ message: 'Not authorized' });
  }
}

function checkValidationErrors(req:Request, res:Response, next:NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export { checkAuth, checkValidationErrors };
