import { Photographer } from './photographer/Photographer'
import { Album } from './album/Album'
import { Photo } from './photo/Photo'
import { PhotoMini } from './photoMini/photoMini'
import { PhotoMiniWaterMark } from './photoMiniWaterMark/PhotoMiniWaterMark'
import { Person } from './person/person'
import { AppUser } from './appUser/appUser'
import { Selfie } from './selfie/selfie'
import { SelfieMini } from './selfieMini/selfieMini'
import { UserOTP } from './userOtp/userOtp'
import { Photo_Person } from './photoPerson/photoPerson'
import { UserAlbum } from './userAlbum/userAlbum'

// Photographer & Album
Photographer.hasMany(Album, {
	sourceKey: 'id',
	foreignKey: 'photographerId',
	as: 'albums'
})
Album.belongsTo(Photographer, {
	foreignKey: 'photographerId',
	as: 'photographer'
})

// Photographer & Photo
Photographer.hasMany(Photo, {
	sourceKey: 'id',
	foreignKey: 'photographerId',
	as: 'photos'
})
Photo.belongsTo(Photographer, {
	foreignKey: 'photographerId',
	as: 'photographer'
})

Photographer.hasMany(PhotoMini)
PhotoMini.belongsTo(Photographer)

Photographer.hasMany(PhotoMiniWaterMark)
PhotoMiniWaterMark.belongsTo(Photographer)

Album.hasMany(Photo)
Photo.belongsTo(Album)

Album.hasMany(PhotoMini)
PhotoMini.belongsTo(Album)

Album.hasMany(PhotoMiniWaterMark)
PhotoMiniWaterMark.belongsTo(Album)

Photo.belongsToMany(Person, { through: 'Photo_Person' })
Person.belongsToMany(Photo, { through: 'Photo_Person' })

AppUser.hasMany(Selfie)
Selfie.belongsTo(AppUser)

AppUser.hasMany(SelfieMini)
SelfieMini.belongsTo(AppUser)

export {
	Photographer,
	Album,
	Photo,
	PhotoMini,
	PhotoMiniWaterMark,
	Person,
	AppUser,
	UserOTP,
	Selfie,
	SelfieMini,
	Photo_Person,
	UserAlbum
}
