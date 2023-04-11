import { AppUserInstance } from '../appUser/interface'
import { DataTypes } from 'sequelize' // с помощью DataTypes описываются типы поля(String, Int,  Array ect.)
import sequelize from '../../db'

export const AppUser = sequelize.define<AppUserInstance>('appUser', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	name: { type: DataTypes.STRING },
	phone: { type: DataTypes.STRING, unique: true },
	countryCode: { type: DataTypes.STRING },
	email: { type: DataTypes.STRING, unique: true },
	textMessagesNotification: { type: DataTypes.BOOLEAN },
	emailNotification: { type: DataTypes.BOOLEAN },
	unsubscribe: { type: DataTypes.BOOLEAN }
})
