// https://dev.to/jctaveras/sequelize-typescript-what-you-need-to-know-41mj

import { Optional, Model } from 'sequelize';
// Photographer
interface PhotographerAttributes {
  id: number;
  login: string;
  password: string;
  email: string;
  fullName: string
}

interface PhotographerCreationAttributes extends Optional<PhotographerAttributes, 'id' | 'fullName' | 'email'> { }
interface PhotographerInstance extends Model<PhotographerAttributes,
  PhotographerCreationAttributes>, PhotographerAttributes { }

// Album
interface AlbumAttributes {
  id: number;
  name: string,
  location: string,
  date: string,
  photographerId:number
}

interface AlbumCreationAttributes extends Optional<AlbumAttributes, 'id' > { }
interface AlbumInstance extends Model<AlbumAttributes, AlbumCreationAttributes>,
  AlbumAttributes {}

// Photo

interface PhotoAttributes {
  id: number;
  name: string,
  photoUrl: string,
  photographerId: number
  albumId:number
}

interface PhotoCreationAttributes extends Optional<PhotoAttributes, 'id'> { }
interface PhotoInstance extends Model<PhotoAttributes, PhotoCreationAttributes>,
  PhotoAttributes {}

// PhotoMini

interface PhotoMiniAttributes {
  id: number;
  name: string,
  photoMiniUrl: string
  albumId: number,
  photographerId:number
}
interface PhotoMiniCreationAttributes extends Optional<PhotoMiniAttributes, 'id'> { }
interface PhotoMiniInstance extends Model<PhotoMiniAttributes, PhotoMiniCreationAttributes>,
  PhotoAttributes {}

// PhotoMiniWaterMark

interface PhotoMiniWaterMarkAttributes {
  id: number;
  name: string,
  albumId: number,
  photographerId: number,
  photoMiniWaterMarkUrl:string
}

interface PhotoMiniWaterMarkCreationAttributes extends Optional<PhotoMiniWaterMarkAttributes, 'id'> { }
interface PhotoMiniWaterMarkInstance extends
  Model<PhotoMiniWaterMarkAttributes, PhotoMiniWaterMarkCreationAttributes>,
  PhotoMiniWaterMarkAttributes {}

// Person
interface PersonAttributes {
  id: number;
  phone: string,
  name: string,
}

interface PersonCreationAttributes extends Optional<PersonAttributes, 'id' | 'name'> { }
interface PersonInstance extends
  Model<PersonAttributes, PersonCreationAttributes>,
  PersonAttributes { }

// AppUser

interface AppUserAttributes {
  id: number,
  name: string,
  phone: string,
  countryCode:string,
  email: string,
  textMessagesNotification: boolean,
  emailNotification: boolean,
  unsubscribe: boolean
}

interface AppUserCreationAttributes extends Optional<AppUserAttributes, 'id' | 'name' | 'email'> { }
interface AppUserInstance extends
  Model<AppUserAttributes, AppUserCreationAttributes>,
  AppUserAttributes { }

// Selfie

interface SelfieAttributes {
  id: number,
  name: string,
  selfieUrl: string,
  active: boolean,
  appUserId:number
}

interface SelfieCreationAttributes extends Optional<SelfieAttributes, 'id'> { }
interface SelfieInstance extends
  Model<SelfieAttributes, SelfieCreationAttributes>,
  SelfieAttributes { }

// SelfirMini
interface SelfieMiniAttributes {
  id: number,
  name: string,
  selfieUrl: string,
  active: boolean
  appUserId:number
}
interface SelfieMiniCreationAttributes extends Optional<SelfieMiniAttributes, 'id'> { }
interface SelfieMiniInstance extends
  Model<SelfieMiniAttributes, SelfieMiniCreationAttributes>,
  SelfieMiniAttributes { }

// UserAlbum
interface UserAlbumAttributes {
 id: number,
  userId: number,
  userName: string,
  albumId: number,
  isPaid: boolean,
}

interface UserAlbumCreationAttributes extends Optional<UserAlbumAttributes, 'id' | 'userName'> { }
interface UserAlbumInstance extends
  Model<UserAlbumAttributes, UserAlbumCreationAttributes>,
  UserAlbumAttributes { }

// Photo_Pesron
interface Photo_PesronAttributes {
 photoId: number,
  personId: number,
}

interface Photo_PesronInstance extends
  Model<Photo_PesronAttributes>,
  Photo_PesronAttributes { }

export {
  PhotographerInstance,
  AlbumInstance,
  PhotoInstance,
  PhotoMiniInstance,
  PhotoMiniWaterMarkInstance,
  PersonInstance,
  AppUserInstance,
  SelfieInstance,
  SelfieMiniInstance,
  UserAlbumInstance,
  Photo_PesronInstance,
};
