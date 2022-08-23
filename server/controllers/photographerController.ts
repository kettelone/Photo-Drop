import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ApiError from '../errors/APIErrors';
import { Photographer as db } from '../models/model';

const DB: any = db;
const Photographer = DB;

const generateJwt = (id:number, login:string) => jwt.sign({ id, login }, process.env.SECRET_KEY!, {
  expiresIn: '24h',
});

class PhotographerController {
  async login(req: Request, res:Response, next: any) {
    try {
      const { login, password } = req.body;
      const user = await Photographer.findOne({ where: { login } });
      if (!user) {
        return next(ApiError.internal('User not found'));
      }
      const comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        return next(ApiError.internal('Wrong password'));
      }
      const token = generateJwt(user.id, user.login);
      return res.json({ token });
    } catch (e) {
      console.log(e);
    }
  }
}

export default new PhotographerController();
