import { Request, Response, NextFunction } from 'express'
import aws from 'aws-sdk'
import photoService from '../../services/userService/photoService'
import APIError from '../../errors/APIError'

// This is your test secret API key.
aws.config.update({
	region: 'eu-west-1',
	accessKeyId: process.env.S3_ACCESS_KEY_ID,
	secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
	signatureVersion: 'v4' // It fixes the issue of "Missing Authentication Token" when generating presignedUrl for Object lambda Access Point
})

class PhotoController {
	async getOriginalPhoto(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		const { originalKey, albumId, userId } = req.query as {
			[key: string]: string
		}
		try {
			const url = await photoService.getOriginalPhoto(
				originalKey,
				albumId,
				userId
			)
			res.json(url)
			return
		} catch (e) {
			next(APIError.internal('Internal error while getting original photo'))
		}
	}
}

export default new PhotoController()
