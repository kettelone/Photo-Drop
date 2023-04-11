// https://dev.to/jctaveras/sequelize-typescript-what-you-need-to-know-41mj

import { Optional, Model } from 'sequelize'

// Album
interface AlbumAttributes {
	id: string
	name: string
	location: string
	date: string
	photographerId: string
}

interface AlbumCreationAttributes extends Optional<AlbumAttributes, 'id'> {}
export interface AlbumInstance
	extends Model<AlbumAttributes, AlbumCreationAttributes>,
		AlbumAttributes {}
