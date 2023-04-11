import aws from 'aws-sdk'
import {
	Person,
	Photo_Person,
	Photo,
	Album,
	AppUser,
	UserAlbum
} from '../../models/relations'
import { TypeAlbumPaidStatus } from '../../models/userAlbum/userAlbum'

const s3 = new aws.S3()

class AlbumService {

	async findUniqueAlbumIds(person_id: string) {
    const photo_person = await Photo_Person.findAll({ where: { personId: person_id } });
    const promises = photo_person.map((record) => Photo.findOne({ where: { id: record.photoId } }));
    const photos = await Promise.all(promises);
    const albumIds = photos.map((photo) => photo?.albumId);
    const uniqueAlbumIds = [...new Set(albumIds)];
    return uniqueAlbumIds;
  }
	async getAlbums(phone: string) {
		// TO DO: check arr.find()
		// check git commint amend
		// Update VS Code
		// check git stash

		const person = await Person.findOne({ where: { phone } })
		if (person) {
			const user = await AppUser.findOne({ where: { phone } })
			const photo_person = await Photo_Person.findAll({
				where: { personId: person.id }
			})
			const photoIds = photo_person.map(({ photoId }) => photoId)
			const photos = await Photo.findAll({ where: { id: photoIds } })
			const albumIds = photos.map(({ albumId }) => albumId)
			const uniqueAlbumIds = [ ...new Set(albumIds) ]
			const albumsInfo = await Album.findAll({ where: { id: uniqueAlbumIds } })
			const userAlbums = await UserAlbum.findAll({
				where: { userId: user!.id, albumId: uniqueAlbumIds }
			})

			const infoCollection = albumsInfo.map(({ id, date, location }) => {
				// get photos which belongs to current album
				const currentPhotos = photos.filter(({ albumId }) => albumId === id)

				// generate thumbnails payment status
				const albumPaidStatus: TypeAlbumPaidStatus = {}
				userAlbums.forEach((album) => {
					albumPaidStatus[album.albumId] = album.isPaid
				})

				// sign thumbnails
				const signedThumbnails = currentPhotos.map((photo) => {
					const url = s3.getSignedUrl('getObject', {
						Bucket:
							albumPaidStatus[photo.albumId] === true
								? process.env.S3_LAMBDA_ACCESS_POINT_IMAGE_RESIZE
								: process.env.S3_LAMBDA_ACCESS_POINT_IMAGE_RESIZE_WATERMARK,
						Key: photo.name,
						Expires: 60 * 120
					})
					const thumbnail = {
						url,
						originalKey: photo.name,
						isPaid: albumPaidStatus[photo.albumId]
					}
					return thumbnail
				})

				// generate album icon url
				const icon = currentPhotos.length
					? s3.getSignedUrl('getObject', {
							Bucket: process.env.S3_LAMBDA_ACCESS_POINT_IMAGE_RESIZE,
							Key: currentPhotos[0].name,
							Expires: 60 * 120
						})
					: null

				return {
					id,
					date,
					location,
					icon,
					thumbnails: signedThumbnails
				}
			})

			return infoCollection
		}
		return false
	}
}

export default new AlbumService()
