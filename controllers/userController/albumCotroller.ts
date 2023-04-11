import { Request, Response, NextFunction } from 'express'
import APIError from '../../errors/APIError'
import albumService from '../../services/userService/albumService'

class AlbumController {
	async getAlbumsWithPerson(
		req: Request<any, any, any, { phone: string }>,
		res: Response,
		next: NextFunction
	): Promise<void> {
		const { phone } = req.query
		try {
			const albumsInfo = await albumService.getAlbums(phone)
			if (albumsInfo) {
				res.json({ albumsInfo })
				return
			}
			next(APIError.notFound('No albums found'))
			return
		} catch (e) {
			next(APIError.notFound('Internal error while getting albums with person'))
		}
	}
}

export default new AlbumController()
