import { Request, Response, NextFunction } from 'express'
import aws from 'aws-sdk'
import { Photographer, Album, Photo, AppUser } from '../../models/relations'
import { PhotosArray } from './interface'
import APIError from '../../errors/APIError'
import photographerService from '../../services/photographerService/photographerService'

const s3 = new aws.S3()

class PhotographerController {
	// create presigned post for photos
	async signPhotos(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const { photosArray, people } = req.body as {
				photosArray: PhotosArray[][]
				people: string[]
			}
			const presignedPostsArray = photographerService.generatePresignedPost(
				photosArray,
				people
			)
			res.send(JSON.stringify(presignedPostsArray))
		} catch (e) {
			next(APIError.internal('Internal error on create presigned post'))
		}
	}

	async getPhotos(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		/* LIMIT will retrieve only the number of records specified after the LIMIT keyword,
     unless the query itself returns fewer records than the number specified by LIMIT.
    OFFSET is used to skip the number of records from the results. */
		const { albumId, photographerId, limit, page } = req.query as {
			[key: string]: string
		}

		const finalPage = Number(page) || 1
		const finalLimit = Number(limit) || 10
		const offset = finalPage * finalLimit - finalLimit

		try {
			const photographerExist = await Photographer.findOne({
				where: { id: photographerId }
			})
			if (!photographerExist) {
				next(APIError.notFound('Photographer with this id does not exist'))
				return
			}
			const albumExist = await Album.findOne({ where: { id: albumId } })
			if (!albumExist) {
				next(APIError.notFound('This album does not exist'))
				return
			}
			const albumBelongsToUser = await Album.findOne({
				where: { id: albumId, photographerId }
			})
			if (!albumBelongsToUser) {
				next(APIError.conflict('This album does not belong to this user'))
				return
			}
			const photos = await Photo.findAndCountAll({
				where: { albumId, photographerId },
				order: [ [ 'createdAt', 'DESC' ] ],
				limit: finalLimit,
				offset
			})

			if (photos.count === 0) {
				res.send({ message: 'The album is empty' })
				return
			}

			const photoKeys = photos.rows.map(({ name }) => {
				const keyObj = { photoKey: name }
				return keyObj
			})
			// TO DO: make array with key(original photo key) and value(url to original photo)
			const photoUrls = photographerService.generatePresignedGet(photoKeys)
			res.json(photoUrls)
			return
		} catch (e) {
			next(APIError.internal('Internal Error on get photos'))
		}
	}

	// // TO DO: remove after Alexey implements changes
	// async createPresignedGetForPhotos(
	// 	req: Request,
	// 	res: Response,
	// 	next: NextFunction
	// ): Promise<void> {
	// 	try {
	// 		const photoKeyArr: { photoKey: string }[] = req.body
	// 		const photoUrls = photographerService.generatePresignedGet(photoKeyArr)
	// 		res.json(photoUrls)
	// 	} catch (e) {
	// 		next(APIError.internal('Internal Error on create presigned get'))
	// 	}
	// }
}

export default new PhotographerController()
