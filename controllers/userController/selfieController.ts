import { Request, Response, NextFunction } from 'express'
import { SelfieMini } from '../../models/relations'
import selfieService from '../../services/userService/selfieService'
import APIError from '../../errors/APIError'

class SelfieController {
	async signSelfie(
		req: Request<any, any, { name: string; userId: string }>,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const { name, userId } = req.body
			const { url, fields } = selfieService.generatePresignedPost(name, userId)
			res.send(JSON.stringify({ url, fields }))
			return
		} catch (e) {
			next(APIError.internal('Internal error while signing selfie'))
		}
	}

	async createPresignedGetForSelfie(
		req: Request<any, any, { selfieKey: string }>,
		res: Response,
		next: NextFunction
	): Promise<void> {
		const { selfieKey } = req.body
		try {
			const url = selfieService.generateSignedUrl(selfieKey)
			res.json(url)
			return
		} catch (e) {
			next(
				APIError.notFound('Internal error while creating signed url for selfie')
			)
		}
	}

	async getSelfie(
		req: Request<any, any, any, { appUserId: string }>,
		res: Response,
		next: NextFunction
	): Promise<void> {
		const { appUserId } = req.query
		try {
			const selfie = await SelfieMini.findOne({
				where: { appUserId, active: true }
			})
			if (selfie) {
				res.json(selfie)
				return
			}
			next(APIError.notFound('User doesn`t have active selfie'))

			return
		} catch (e) {
			next(APIError.notFound('Internal error while getting selfie'))
			console.log(e)
		}
	}
}

export default new SelfieController()
