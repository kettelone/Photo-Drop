import { DataTypes } from 'sequelize' // с помощью DataTypes описываются типы поля(String, Int,  Array ect.)
import sequelize from '../../db'
import { PersonInstance } from '../interfaces'

export const Person = sequelize.define<PersonInstance>('person', {
	id: {
		type: DataTypes.UUID,
		primaryKey: true,
		defaultValue: DataTypes.UUIDV4
	},
	phone: { type: DataTypes.STRING, unique: true },
	name: { type: DataTypes.STRING }
})
