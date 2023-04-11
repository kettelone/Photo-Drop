import aws from 'aws-sdk'
import Stripe from 'stripe'
import { UserAlbum } from '../../models/relations'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2022-08-01'
})
const s3 = new aws.S3()

class AppUserService {
	async getOriginalPhoto(originalKey: string, albumId: string, userId: string) {
		const info = await UserAlbum.findOne({ where: { userId, albumId } })
		const url = s3.getSignedUrl('getObject', {
			Bucket:
				info && info.isPaid === true
					? process.env.S3_BUCKET_ORIGINAL
					: process.env.S3_LAMBDA_ACCESS_POINT_IMAGE_WATERMARK,
			Key: originalKey,
			Expires: 60 * 120
		})

		// serve view url to display photo(lower quality - faster display), and dowloadUrl to download image
		// if (info && info.isPaid === true) {
		//   const downloadUrl = s3.getSignedUrl('getObject', {
		//     Bucket: process.env.S3_BUCKET,
		//     Key: originalKey,
		//     Expires: 60 * 120,
		//   });

		//   return { viewUrl: url, downloadUrl };
		// }

		return url
	}
}

export default new AppUserService()
