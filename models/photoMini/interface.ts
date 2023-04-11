import { Optional, Model } from 'sequelize'

interface PhotoAttributes {
	id: string
	name: string
	photoUrl: string
	photographerId: string
	albumId: string
}
interface PhotoMiniAttributes {
	id: string
	name: string
	photoMiniUrl: string
	albumId: string
	photographerId: string
}
interface PhotoMiniCreationAttributes
	extends Optional<PhotoMiniAttributes, 'id'> {}
export interface PhotoMiniInstance
	extends Model<PhotoMiniAttributes, PhotoMiniCreationAttributes>,
		PhotoAttributes {}
