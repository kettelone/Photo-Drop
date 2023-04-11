import { Optional, Model } from 'sequelize'

interface PhotoAttributes {
	id: string
	name: string
	photoUrl: string
	photographerId: string
	albumId: string
}

interface PhotoCreationAttributes extends Optional<PhotoAttributes, 'id'> {}
export interface PhotoInstance
	extends Model<PhotoAttributes, PhotoCreationAttributes>,
		PhotoAttributes {}
