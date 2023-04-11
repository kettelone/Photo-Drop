import { Optional, Model } from 'sequelize'
// Photographer
interface PhotographerAttributes {
	id: string
	index: number
	login: string
	password: string
	email: string
	fullName: string
	createdAt: string
	updatedAt: string
}

interface PhotographerCreationAttributes
	extends Optional<
			PhotographerAttributes,
			'id' | 'fullName' | 'email' | 'index'
		> {}
export interface PhotographerInstance
	extends Model<PhotographerAttributes, PhotographerCreationAttributes>,
		PhotographerAttributes {}
