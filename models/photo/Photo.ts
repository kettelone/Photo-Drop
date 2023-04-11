import { PhotoInstance } from './interface'
import { DataTypes } from 'sequelize' // с помощью DataTypes описываются типы поля(String, Int,  Array ect.)
import sequelize from '../../db'

export const Photo = sequelize.define<PhotoInstance>('photo', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	name: { type: DataTypes.STRING },
	photoUrl: { type: DataTypes.STRING },
	photographerId: { type: DataTypes.UUID, allowNull: false },
	albumId: { type: DataTypes.UUID, allowNull: false }
})
