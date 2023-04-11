import { AlbumInstance } from './interface'
import { DataTypes } from 'sequelize' // с помощью DataTypes описываются типы поля(String, Int,  Array ect.)
import sequelize from '../../db'

//
export const Album = sequelize.define<AlbumInstance>('album', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	name: { type: DataTypes.STRING, allowNull: false },
	location: { type: DataTypes.STRING, allowNull: false },
	date: { type: DataTypes.DATE, allowNull: false },
	photographerId: { type: DataTypes.UUID, allowNull: false }
})
