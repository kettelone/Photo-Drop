import { PhotoMiniWaterMarkInstance } from './interface'
import { DataTypes } from 'sequelize' // с помощью DataTypes описываются типы поля(String, Int,  Array ect.)
import sequelize from '../../db'

// PhotoMiniWaterMark
export const PhotoMiniWaterMark = sequelize.define<
	PhotoMiniWaterMarkInstance
>('photoMiniWaterMark', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	name: { type: DataTypes.STRING },
	photoMiniWaterMarkUrl: { type: DataTypes.STRING },
	photographerId: { type: DataTypes.UUID, allowNull: false },
	albumId: { type: DataTypes.UUID, allowNull: false }
})
