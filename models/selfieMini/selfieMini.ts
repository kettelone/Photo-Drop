import { SelfieMiniInstance } from './interface'
import { DataTypes } from 'sequelize' // с помощью DataTypes описываются типы поля(String, Int,  Array ect.)
import sequelize from '../../db'

export const SelfieMini = sequelize.define<SelfieMiniInstance>('selfieMini', {
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
