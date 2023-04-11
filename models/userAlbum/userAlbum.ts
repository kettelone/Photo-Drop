import { UserAlbumInstance } from './interface'
import { DataTypes } from 'sequelize' // с помощью DataTypes описываются типы поля(String, Int,  Array ect.)
import sequelize from '../../db'

export const UserAlbum = sequelize.define<UserAlbumInstance>('userAlbum', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	userId: { type: DataTypes.UUID },
	userName: { type: DataTypes.STRING },
	albumId: { type: DataTypes.UUID },
	isPaid: { type: DataTypes.BOOLEAN }
})

export type TypeAlbumPaidStatus = { [key: string]: boolean }
