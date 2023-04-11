import { Optional, Model } from 'sequelize'

interface AppUserAttributes {
	id: string
	name: string
	phone: string
	countryCode: string
	email: string
	textMessagesNotification: boolean
	emailNotification: boolean
	unsubscribe: boolean
}

interface AppUserCreationAttributes
	extends Optional<AppUserAttributes, 'id' | 'name' | 'email'> {}
export interface AppUserInstance
	extends Model<AppUserAttributes, AppUserCreationAttributes>,
		AppUserAttributes {}
