import aws from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'

const s3 = new aws.S3()

class SelfieService {
	generatePresignedPost(name: string, userId: string) {
		const startIndex = name.indexOf('.') + 1
		const photoExtension = name.substr(startIndex)
		const { url, fields } = s3.createPresignedPost({
			Fields: {
				key: `${uuidv4()}.${photoExtension}`,
				'Content-Type': `image/${photoExtension}`,
				'x-amz-meta-userId': userId,
				originalSelfieKey: name
			},
			Conditions: [ [ 'content-length-range', 0, 5000000 ] ],
			Expires: 60 * 120, // seconds
			Bucket: process.env.S3_SELFIE_BUCKET
		})

		return { url, fields }
	}

	generateSignedUrl(selfieKey: string) {
		const url = s3.getSignedUrl('getObject', {
			Bucket: process.env.S3_LAMBDA_ACCESS_POINT_SELFIE_RESIZE,
			Key: selfieKey,
			Expires: 60 * 120
		})
		return url
	}
}

export default new SelfieService()
