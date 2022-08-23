import { DataTypes } from 'sequelize'; // с помощью DataTypes описываются типы поля(String, Int,  Array ect.)
import sequelize from '../db';

const Photographer = sequelize.define('photographer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  login: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true },
  fullName: { type: DataTypes.STRING },
});

const Album = sequelize.define('album', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false },
});

const Photo = sequelize.define('photo', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  photoUrl: { type: DataTypes.STRING },
});

const PhotoWaterMark = sequelize.define('photoWaterMark', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  photoWaterMarkUrl: { type: DataTypes.STRING },
});

const PhotoMini = sequelize.define('photoMini', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  photoMiniUrl: { type: DataTypes.STRING },
});

const PhotoMiniWaterMark = sequelize.define('photoMiniWaterMark', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  photoMiniWaterMarkUrl: { type: DataTypes.STRING },
});

const Person = sequelize.define('person', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
});

const AppUser = sequelize.define('appUser', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING, unique: true },
  email: { type: DataTypes.STRING, unique: true },
});

const Selfie = sequelize.define('selfie', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  selfieUrl: { type: DataTypes.STRING },
  active: { type: DataTypes.BOOLEAN },
});

Photographer.hasMany(Album);
Album.belongsTo(Photographer);

Album.hasMany(Photo);
Photo.belongsTo(Album);

Album.hasMany(PhotoWaterMark);
PhotoWaterMark.belongsTo(Album);

Album.hasMany(PhotoMini);
PhotoMini.belongsTo(Album);

Album.hasMany(PhotoMiniWaterMark);
PhotoMiniWaterMark.belongsTo(Album);

Photo.hasMany(Person);
Person.belongsTo(Photo);

PhotoWaterMark.hasMany(Person);
Person.belongsTo(PhotoWaterMark);

PhotoMini.hasMany(Person);
Person.belongsTo(PhotoMini);

PhotoMiniWaterMark.hasMany(Person);
Person.belongsTo(PhotoMiniWaterMark);

AppUser.hasMany(Selfie);
Selfie.belongsTo(AppUser);

export {
  Photographer, Album, Photo, PhotoWaterMark, PhotoMini, PhotoMiniWaterMark, Person, AppUser, Selfie,
};
