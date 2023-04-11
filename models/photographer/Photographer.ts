import { PhotographerInstance } from './interface'
import { DataTypes } from 'sequelize' // с помощью DataTypes описываются типы поля(String, Int,  Array ect.)
import sequelize from '../../db'

// Photographer
export const Photographer = sequelize.define<
	PhotographerInstance
>('photographer', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	index: { type: DataTypes.INTEGER, autoIncrement: true },
	login: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	password: { type: DataTypes.STRING, allowNull: false },
	email: { type: DataTypes.STRING },
	fullName: { type: DataTypes.STRING },
	createdAt: { type: DataTypes.DATE, allowNull: true },
	updatedAt: { type: DataTypes.DATE, allowNull: true }
})
