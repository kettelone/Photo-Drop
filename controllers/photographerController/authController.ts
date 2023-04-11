import { Request, Response, NextFunction } from 'express'
import APIError from '../../errors/APIError'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Photographer } from '../../models/relations'

class AuthController {
	async login(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { login, password } = req.body as { [key: string]: string }
			const user = await Photographer.findOne({ where: { login } })
			if (!user) {
				next(APIError.unauthorized('User not found'))
				return
			}
			const comparePassword = bcrypt.compareSync(password, user.password)
			if (!comparePassword) {
				next(APIError.unauthorized('Wrong password'))
				return
			}
			const token = jwt.sign(
				{ id: user.id, login: user.login },
				process.env.SECRET_KEY!,
				{
					expiresIn: '24h'
				}
			)
			res.json({ token })
			return
		} catch (e) {
			console.log(e)
			next(APIError.internal('Internal error on login'))
		}
	}

	async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			if (!req.headers.authorization) {
				next(APIError.unauthorized('Missing authorization token'))
				return
			}
			const token = req.headers.authorization.split(' ')[1] // Bearer ddhcjhdsjcsdcs
			if (!token) {
				next(APIError.unauthorized('Not authorized'))
			}
			jwt.verify(token, process.env.SECRET_KEY!)
			res.send()
		} catch (e) {
			next(APIError.unauthorized('Not authorized'))
		}
	}
}

export default new AuthController()
