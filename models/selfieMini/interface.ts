import { Optional, Model } from 'sequelize'

interface SelfieMiniAttributes {
	id: string
	name: string
	selfieUrl: string
	active: boolean
	appUserId: string
}
interface SelfieMiniCreationAttributes
	extends Optional<SelfieMiniAttributes, 'id'> {}
export interface SelfieMiniInstance
	extends Model<SelfieMiniAttributes, SelfieMiniCreationAttributes>,
		SelfieMiniAttributes {}
