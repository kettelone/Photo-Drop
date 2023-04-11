import { PhotoMiniInstance } from './interface'
import { DataTypes } from 'sequelize' // с помощью DataTypes описываются типы поля(String, Int,  Array ect.)
import sequelize from '../../db'

export const PhotoMini = sequelize.define<PhotoMiniInstance>('photoMini', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	name: { type: DataTypes.STRING },
	photoMiniUrl: { type: DataTypes.STRING },
	photographerId: { type: DataTypes.UUID, allowNull: false },
	albumId: { type: DataTypes.UUID, allowNull: false }
})
