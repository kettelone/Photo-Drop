import { Optional, Model } from 'sequelize'

interface SelfieAttributes {
	id: string
	name: string
	selfieUrl: string
	active: boolean
	appUserId: string
}

interface SelfieCreationAttributes extends Optional<SelfieAttributes, 'id'> {}
export interface SelfieInstance
	extends Model<SelfieAttributes, SelfieCreationAttributes>,
		SelfieAttributes {}
