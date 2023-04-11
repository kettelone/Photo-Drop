import { Model } from 'sequelize'

interface Photo_PesronAttributes {
	photoId: string
	personId: string
}

export interface Photo_PesronInstance
	extends Model<Photo_PesronAttributes>,
		Photo_PesronAttributes {}
