import { Request, Response, NextFunction } from 'express'
import { AppUser } from '../../models/relations'
import APIError from '../../errors/APIError'

class PeopleController {
	async getAllPeople(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const people = await AppUser.findAll()
			res.json({ people })
		} catch (e) {
			console.log(e)
			next(APIError.internal('Internal error on getAllPeople'))
		}
	}
}

export default new PeopleController()
