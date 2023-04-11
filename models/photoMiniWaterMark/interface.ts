import { Optional, Model } from 'sequelize'

interface PhotoMiniWaterMarkAttributes {
	id: string
	name: string
	albumId: string
	photographerId: string
	photoMiniWaterMarkUrl: string
}

interface PhotoMiniWaterMarkCreationAttributes
	extends Optional<PhotoMiniWaterMarkAttributes, 'id'> {}
export interface PhotoMiniWaterMarkInstance
	extends Model<
			PhotoMiniWaterMarkAttributes,
			PhotoMiniWaterMarkCreationAttributes
		>,
		PhotoMiniWaterMarkAttributes {}
