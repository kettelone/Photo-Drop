import { Optional, Model } from 'sequelize'

interface UserAlbumAttributes {
	id: string
	userId: string
	userName: string
	albumId: string
	isPaid: boolean
}

interface UserAlbumCreationAttributes
	extends Optional<UserAlbumAttributes, 'id' | 'userName'> {}
export interface UserAlbumInstance
	extends Model<UserAlbumAttributes, UserAlbumCreationAttributes>,
		UserAlbumAttributes {}
