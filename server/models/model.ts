import {
  DataTypes, ModelDefined,
} from 'sequelize'; // с помощью DataTypes описываются типы поля(String, Int,  Array ect.)
import sequelize from '../db';
import {
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
} from './interfaces';

const Photographer: ModelDefined<PhotographerAttributes, PhotographerCreationAttributes> = sequelize.define('photographer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  login: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING },
  fullName: { type: DataTypes.STRING },
});

const Album:ModelDefined<AlbumAttributes, AlbumCreationAttributes> = sequelize.define('album', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false },
});

const Photo:ModelDefined<PhotoAttributes, PhotoCreationAttributes> = sequelize.define('photo', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  photoUrl: { type: DataTypes.STRING },
});

const PhotoMini:ModelDefined<PhotoMiniAttributes, PhotoMiniCreationAttributes> = sequelize.define('photoMini', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  photoMiniUrl: { type: DataTypes.STRING },
});

const PhotoMiniWaterMark:ModelDefined<PhotoMiniWaterMarkAttributes, PhotoMiniWaterMarkCreationAttributes> = sequelize.define('photoMiniWaterMark', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  photoMiniWaterMarkUrl: { type: DataTypes.STRING },
});

const Person:ModelDefined<PersonAttributes, PersonCreationAttributes> = sequelize.define('person', {
  id: {
    type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true,
  },
  phone: { type: DataTypes.STRING, unique: true },
  name: { type: DataTypes.STRING },
});

const AppUser:ModelDefined<AppUserAttributes, AppUserCreationAttributes> = sequelize.define('appUser', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING, unique: true },
  email: { type: DataTypes.STRING, unique: true },
  textMessagesNotification: { type: DataTypes.BOOLEAN },
  emailNotification: { type: DataTypes.BOOLEAN },
  unsubscribe: { type: DataTypes.BOOLEAN },
});

const Selfie:ModelDefined<SelfieAttributes, SelfieCreationAttributes> = sequelize.define('selfie', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  selfieUrl: { type: DataTypes.STRING },
  active: { type: DataTypes.BOOLEAN },
});

const SelfieMini:ModelDefined<SelfieMiniAttributes, SelfieMiniCreationAttributes> = sequelize.define('selfieMini', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  selfieUrl: { type: DataTypes.STRING },
  active: { type: DataTypes.BOOLEAN },
});

const UserAlbum:ModelDefined<UserAlbumAttributes, UserAlbumCreationAttributes> = sequelize.define('userAlbum', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  userName: { type: DataTypes.STRING },
  albumId: { type: DataTypes.INTEGER },
  isPaid: { type: DataTypes.BOOLEAN },
});

const Photo_Person = sequelize.define('Photo_Person', {
  photoId: { type: DataTypes.INTEGER },
  personId: { type: DataTypes.INTEGER },
});

const PhotoMini_Person = sequelize.define('PhotoMini_Person', {
  photoMiniId: { type: DataTypes.INTEGER },
  personId: { type: DataTypes.INTEGER },
});

const PhotoMiniWaterMark_Person = sequelize.define('PhotoMiniWaterMark_Person', {
  photoMiniWaterMarkId: { type: DataTypes.INTEGER },
  personId: { type: DataTypes.INTEGER },
});

Photographer.hasMany(Album);
Album.belongsTo(Photographer);

Photographer.hasMany(Photo);
Photo.belongsTo(Photographer);

Photographer.hasMany(PhotoMini);
PhotoMini.belongsTo(Photographer);

Photographer.hasMany(PhotoMiniWaterMark);
PhotoMiniWaterMark.belongsTo(Photographer);

Album.hasMany(Photo);
Photo.belongsTo(Album);

Album.hasMany(PhotoMini);
PhotoMini.belongsTo(Album);

Album.hasMany(PhotoMiniWaterMark);
PhotoMiniWaterMark.belongsTo(Album);

Photo.belongsToMany(Person, { through: 'Photo_Person' });
Person.belongsToMany(Photo, { through: 'Photo_Person' });

AppUser.hasMany(Selfie);
Selfie.belongsTo(AppUser);

AppUser.hasMany(SelfieMini);
SelfieMini.belongsTo(AppUser);

export {
  Photographer,
  Album,
  Photo,
  PhotoMini,
  PhotoMiniWaterMark,
  Person,
  AppUser,
  Selfie,
  SelfieMini,
  Photo_Person,
  PhotoMini_Person,
  PhotoMiniWaterMark_Person,
  UserAlbum,
};
