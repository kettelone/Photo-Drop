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
  id: { type: DataTypes.INTEGER, autoIncrement: true },
  name: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false },
});

const Photo = sequelize.define('photo', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  photoUrl: { type: DataTypes.STRING },
});

// const PhotoWaterMark = sequelize.define('photoWaterMark', {
//   id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//   name: { type: DataTypes.STRING },
//   photoWaterMarkUrl: { type: DataTypes.STRING },
// });

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
  textMessagesNotification: { type: DataTypes.BOOLEAN },
  emailNotification: { type: DataTypes.BOOLEAN },
  unsubscribe: { type: DataTypes.BOOLEAN },
});

const Selfie = sequelize.define('selfie', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  selfieUrl: { type: DataTypes.STRING },
  active: { type: DataTypes.BOOLEAN },
});
// eslint-disable-next-line camelcase
const Photo_Person = sequelize.define('Photo_Person', {
  photoId: { type: DataTypes.INTEGER },
  personId: { type: DataTypes.INTEGER },
});

// eslint-disable-next-line camelcase
const PhotoMini_Person = sequelize.define('PhotoMini_Person', {
  photoMiniId: { type: DataTypes.INTEGER },
  personId: { type: DataTypes.INTEGER },
});

// eslint-disable-next-line camelcase
const PhotoMiniWaterMark_Person = sequelize.define('PhotoMiniWaterMark_Person', {
  photoMiniWaterMarkId: { type: DataTypes.INTEGER },
  personId: { type: DataTypes.INTEGER },
});

Photographer.hasMany(Album);
Album.belongsTo(Photographer);

Photographer.hasMany(Photo);
Photo.belongsTo(Photographer);

Album.hasMany(Photo);
Photo.belongsTo(Album);

Photo.belongsToMany(Person, { through: 'Photo_Person' });
Person.belongsToMany(Photo, { through: 'Photo_Person' });

PhotoMini.belongsToMany(Person, { through: 'PhotoMini_Person' });
Person.belongsToMany(PhotoMini, { through: 'PhotoMini_Person' });

PhotoMiniWaterMark.belongsToMany(Person, { through: 'PhotoMiniWaterMark_Person' });
Person.belongsToMany(PhotoMiniWaterMark, { through: 'PhotoMiniWaterMark_Person' });

AppUser.hasMany(Selfie);
Selfie.belongsTo(AppUser);

export {
  Photographer,
  Album,
  Photo,
  PhotoMini,
  PhotoMiniWaterMark,
  Person,
  AppUser,
  Selfie,
  // eslint-disable-next-line camelcase
  Photo_Person,
  // eslint-disable-next-line camelcase
  PhotoMini_Person,
  // eslint-disable-next-line camelcase
  PhotoMiniWaterMark_Person,
};
