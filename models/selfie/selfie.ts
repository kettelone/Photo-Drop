import { SelfieInstance } from './interface'
import { DataTypes } from 'sequelize' // с помощью DataTypes описываются типы поля(String, Int,  Array ect.)
import sequelize from '../../db'

export const Selfie = sequelize.define<SelfieInstance>('selfie', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	name: { type: DataTypes.STRING },
	selfieUrl: { type: DataTypes.STRING },
	active: { type: DataTypes.BOOLEAN },
	appUserId: { type: DataTypes.UUID, allowNull: false }
})
