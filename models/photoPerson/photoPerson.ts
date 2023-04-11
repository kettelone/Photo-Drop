import { Photo_PesronInstance } from './interface'
import { DataTypes } from 'sequelize' // с помощью DataTypes описываются типы поля(String, Int,  Array ect.)
import sequelize from '../../db'

export const Photo_Person = sequelize.define<
	Photo_PesronInstance
>('Photo_Person', {
	photoId: { type: DataTypes.UUID },
	personId: { type: DataTypes.UUID }
})
