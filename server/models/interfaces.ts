import { Optional } from 'sequelize';

interface PhotographerAttributes {
  id: number;
  login: string,
  password: string,
  email: string,
  fullName:string
}

type PhotographerCreationAttributes = Optional<PhotographerAttributes, 'id'>;

interface AlbumAttributes {
  id: number;
  name: string,
  location: string,
  date: string,
  photographerId: number
}

type AlbumCreationAttributes = Optional<AlbumAttributes, 'id'>;

interface PhotoAttributes {
  id: number;
  name: string,
  photoUrl: string,
  photographerId: number
  albumId:number
}

type PhotoCreationAttributes = Optional<PhotoAttributes, 'id'|'photographerId'>;

interface PhotoMiniAttributes {
  id: number;
  name: string,
  photoMiniUrl: string
  albumId: number,
  photographerId:number
}

type PhotoMiniCreationAttributes = Optional<PhotoMiniAttributes, 'id'>;

interface PhotoMiniWaterMarkAttributes {
  id: number;
  name: string,
  albumId: number,
  photographerId: number,
  photoMiniWaterMarkUrl:string
}

type PhotoMiniWaterMarkCreationAttributes = Optional<PhotoMiniWaterMarkAttributes, 'id'>;

interface PersonAttributes {
  id: number;
  phone: string,
  name: string,
  photoId: number
}

type PersonCreationAttributes = Optional<PersonAttributes, 'id' | 'name'| 'photoId'>;

interface AppUserAttributes {
  id: number,
  name: string,
  phone: string,
  email: string,
  textMessagesNotification: boolean,
  emailNotification: boolean,
  unsubscribe: boolean
}

type AppUserCreationAttributes = Optional<AppUserAttributes, 'name' | 'id' | 'email'>;

interface SelfieAttributes {
  id: number,
  name: string,
  selfieUrl: string,
  active: boolean,
  appUserId:number
}

type SelfieCreationAttributes = Optional<SelfieAttributes, 'id'>;

interface SelfieMiniAttributes {
  id: number,
  name: string,
  selfieUrl: string,
  active: boolean
  appUserId:number
}

type SelfieMiniCreationAttributes = Optional<SelfieMiniAttributes, 'id'>;

interface UserAlbumAttributes {
 id: number,
  userId: number,
  userName: string,
  albumId: number,
  isPaid: boolean,
}

type UserAlbumCreationAttributes = Optional<UserAlbumAttributes, 'id'|'userName'>;

export {
  PhotographerAttributes, PhotographerCreationAttributes,
  AlbumAttributes, AlbumCreationAttributes,
  PhotoAttributes, PhotoCreationAttributes,
  PhotoMiniAttributes, PhotoMiniCreationAttributes,
  PhotoMiniWaterMarkAttributes, PhotoMiniWaterMarkCreationAttributes,
  PersonAttributes, PersonCreationAttributes,
  AppUserAttributes, AppUserCreationAttributes,
  SelfieAttributes, SelfieCreationAttributes,
  SelfieMiniAttributes, SelfieMiniCreationAttributes,
  UserAlbumAttributes, UserAlbumCreationAttributes,
};
