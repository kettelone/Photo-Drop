import { Request, Response, NextFunction } from 'express'
import { Photographer, Album, Photo, AppUser } from '../../models/relations'
import aws from 'aws-sdk'
import APIError from '../../errors/APIError'
import photographerService from '../../services/photographerService/photographerService'

const s3 = new aws.S3()

class AlbumController {
	async createAlbum(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		const { name, location, date, photographerId } = req.body as {
			[key: string]: string
		}

		try {
			const photographerExist = await Photographer.findOne({
				where: { id: photographerId }
			})
			if (!photographerExist) {
				next(APIError.notFound('Photographer does not exist'))
				return
			}
			const albumExist = await Album.findOne({
				where: { name, photographerId }
			})
			if (!albumExist) {
				const album = await Album.create({
					name,
					location,
					date,
					photographerId
				})
				res.json(album)
				return
			}
			next(APIError.conflict('The album with this name already exist'))
			return
		} catch (e) {
			console.log(e)
			next(APIError.internal('internal error'))
		}
	}

	async getAlbums(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		const { photographerId } = req.query as { photographerId: string }
		try {
			const photographerExist = await Photographer.findOne({
				where: { id: photographerId }
			})
			if (!photographerExist) {
				next(APIError.notFound('Photographer with this id does not exist'))
				return
			}
			const albums = await Album.findAll({ where: { photographerId } })
			const photos = await Photo.findAll({
				where: { photographerId },
				order: [ [ 'createdAt', 'DESC' ] ]
			})
			if (albums.length < 1) {
				next(APIError.notFound('No albums found'))
				return
			}
			const albumsInfo = albums.map(({ id, name, location, date }) => {
				const currentPhotos = photos.filter(({ albumId }) => albumId === id)
				// sign photo thumbnails
				const signedThumbnails = currentPhotos.map((photo) => {
					const url = s3.getSignedUrl('getObject', {
						Bucket: process.env.S3_LAMBDA_ACCESS_POINT_IMAGE_RESIZE,
						Key: photo.name,
						Expires: 60 * 120
					})
					const thumbnail = {
						url,
						originalKey: photo.name
					}
					return thumbnail
				})

				// album icon url
				const icon = signedThumbnails.length ? signedThumbnails[0].url : null

				return {
					id,
					name,
					location,
					date,
					icon,
					thumbnails: signedThumbnails
				}
			})

			res.send({ photographerId, albumsInfo })
			return
		} catch (e) {
			next(APIError.internal('Internal error on getAlbums'))
		}
	}

	// TO DO: delete after Alexey implements changes
	async getAlbumsThumbnailIcon(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		const { albumIds }: { albumIds: string[] } = req.body
		try {
			const albumThumbnails = await photographerService.getAlbumThumbnails(
				albumIds
			)
			res.json(albumThumbnails)
		} catch (e) {
			console.log(e)
			next(APIError.internal('Internal error on get album icon'))
		}
	}
}

export default new AlbumController()
