/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./db.ts":
/*!***************!*\
  !*** ./db.ts ***!
  \***************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const dotenv_1 = __importDefault(__webpack_require__(/*! dotenv */ "dotenv"));
const pg = __importStar(__webpack_require__(/*! pg */ "pg"));
const sequelize_1 = __webpack_require__(/*! sequelize */ "sequelize");
dotenv_1.default.config();
const sequelize = new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'postgres',
    dialectModule: pg,
    define: {
        timestamps: false,
    },
});
exports["default"] = sequelize;


/***/ }),

/***/ "./lambdas/selfieLambda/selfieLambda.ts":
/*!**********************************************!*\
  !*** ./lambdas/selfieLambda/selfieLambda.ts ***!
  \**********************************************/
/***/ (function(module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! dotenv/config */ "dotenv/config");
const aws_sdk_1 = __importDefault(__webpack_require__(/*! aws-sdk */ "aws-sdk"));
// import sharp from 'sharp';
const es_1 = __importDefault(__webpack_require__(/*! jimp/es */ "jimp/es"));
const model_1 = __webpack_require__(/*! ../../models/model */ "./models/model.ts");
// get reference to S3 client
const s3 = new aws_sdk_1.default.S3();
// @ts-ignore
const baseHandler = async (event) => {
    // Get the object from the event and show its content type
    const bucket = event.Records[0].s3.bucket.name;
    const dstBucket = `${bucket}-resized`;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const dstKey = key;
    const params = {
        Bucket: bucket,
        Key: key,
    };
    try {
        const data = await s3.getObject(params).promise();
        const metadata = (!data) ? null : data.Metadata;
        if (metadata) {
            const userid = Number(metadata.userid);
            // save selfie info to db
            const urlSelfie = `https://${bucket}.s3.eu-west-1.amazonaws.com/${key}`;
            console.log('METADATA IS: ', metadata.userid);
            try {
                const oldSelfies = await model_1.Selfie.findAll({ where: { appUserId: userid } });
                for (let i = 0; i < oldSelfies.length; i += 1) {
                    oldSelfies[i].active = false;
                    // eslint-disable-next-line no-await-in-loop
                    await oldSelfies[i].save();
                }
                const selfie = await model_1.Selfie.create({
                    name: key, selfieUrl: urlSelfie, active: true, appUserId: userid,
                });
                console.log('Selfie is: ', selfie);
            }
            catch (e) {
                console.log(e);
                return;
            }
            // Infer the image type from the file suffix.
            const typeMatch = key.match(/\.([^.]*)$/);
            if (!typeMatch) {
                console.log('Could not determine the image type.');
                return;
            }
            // Check that the image type is supported
            const imageType = typeMatch[1].toLowerCase();
            if (imageType !== 'jpg' && imageType !== 'png' && imageType !== 'jpeg') {
                console.log(`Unsupported image type: ${imageType}`);
                return;
            }
            // Download the image from the S3 source bucket.
            let origimage;
            try {
                // eslint-disable-next-line no-shadow
                const params = {
                    Bucket: bucket,
                    Key: key,
                };
                // eslint-disable-next-line vars-on-top, no-var
                origimage = await s3.getObject(params).promise();
            }
            catch (error) {
                console.log(error);
                return;
            }
            // set thumbnail width. Resize will set the height automatically to maintain aspect ratio.
            const height = 250;
            // Use the sharp module to resize the image and save in a buffer.
            let buffer;
            try {
                console.log('is buffer: ', Buffer.isBuffer(origimage.Body));
                // @ts-ignore
                // buffer = await sharp(origimage.Body).resize(width).toBuffer();
                buffer = await es_1.default.read(origimage.Body).then((image) => {
                    const resizedImage = image
                        .resize(es_1.default.AUTO, height)
                        .quality(100) // set JPEG quality
                        .getBufferAsync(es_1.default.MIME_JPEG);
                    return resizedImage;
                });
            }
            catch (error) {
                console.log(error);
                return;
            }
            // Upload the thumbnail image to the destination bucket
            try {
                const destparams = {
                    Bucket: dstBucket,
                    Key: dstKey,
                    Body: buffer,
                    ContentType: 'image',
                };
                const putResult = await s3.putObject(destparams).promise();
                if (putResult) {
                    try {
                        // save resized photo info to db
                        const urlSelfieMini = `https://${dstBucket}.s3.eu-west-1.amazonaws.com/${dstKey}`;
                        const oldSelfies = await model_1.SelfieMini.findAll({ where: { appUserId: userid } });
                        for (let i = 0; i < oldSelfies.length; i += 1) {
                            oldSelfies[i].active = false;
                            // eslint-disable-next-line no-await-in-loop
                            await oldSelfies[i].save();
                        }
                        try {
                            await model_1.SelfieMini.create({
                                name: dstKey, selfieUrl: urlSelfieMini, active: true, appUserId: userid,
                            });
                        }
                        catch (e) {
                            console.log(e);
                            return;
                        }
                    }
                    catch (e) {
                        console.log(e);
                        return;
                    }
                    console.log(`Successfully resized ${bucket}/${key} and uploaded to ${dstBucket}/${dstKey}`);
                }
            }
            catch (error) {
                console.log(error);
                return;
            }
            return;
        }
    }
    catch (err) {
        console.log(err);
        const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
        console.log(message);
        throw new Error(message);
    }
};
// @ts-ignore
const handler = baseHandler;
module.exports.handler = handler;


/***/ }),

/***/ "./models/model.ts":
/*!*************************!*\
  !*** ./models/model.ts ***!
  \*************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserAlbum = exports.Photo_Person = exports.SelfieMini = exports.Selfie = exports.AppUser = exports.Person = exports.PhotoMiniWaterMark = exports.PhotoMini = exports.Photo = exports.Album = exports.Photographer = void 0;
const sequelize_1 = __webpack_require__(/*! sequelize */ "sequelize"); // с помощью DataTypes описываются типы поля(String, Int,  Array ect.)
const db_1 = __importDefault(__webpack_require__(/*! ../db */ "./db.ts"));
// Photographer
const Photographer = db_1.default.define('photographer', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    login: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    email: { type: sequelize_1.DataTypes.STRING },
    fullName: { type: sequelize_1.DataTypes.STRING },
});
exports.Photographer = Photographer;
// Album
const Album = db_1.default.define('album', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    location: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    date: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    photographerId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
});
exports.Album = Album;
// Photo
const Photo = db_1.default.define('photo', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING },
    photoUrl: { type: sequelize_1.DataTypes.STRING },
    photographerId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    albumId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
});
exports.Photo = Photo;
// PhotoMini
const PhotoMini = db_1.default.define('photoMini', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING },
    photoMiniUrl: { type: sequelize_1.DataTypes.STRING },
    photographerId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    albumId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
});
exports.PhotoMini = PhotoMini;
// PhotoMiniWaterMark
const PhotoMiniWaterMark = db_1.default.define('photoMiniWaterMark', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING },
    photoMiniWaterMarkUrl: { type: sequelize_1.DataTypes.STRING },
    photographerId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    albumId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
});
exports.PhotoMiniWaterMark = PhotoMiniWaterMark;
// Person
const Person = db_1.default.define('person', {
    id: {
        type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true,
    },
    phone: { type: sequelize_1.DataTypes.STRING, unique: true },
    name: { type: sequelize_1.DataTypes.STRING },
});
exports.Person = Person;
// Appuser
const AppUser = db_1.default.define('appUser', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING },
    phone: { type: sequelize_1.DataTypes.STRING, unique: true },
    email: { type: sequelize_1.DataTypes.STRING, unique: true },
    textMessagesNotification: { type: sequelize_1.DataTypes.BOOLEAN },
    emailNotification: { type: sequelize_1.DataTypes.BOOLEAN },
    unsubscribe: { type: sequelize_1.DataTypes.BOOLEAN },
});
exports.AppUser = AppUser;
// Selfie
const Selfie = db_1.default.define('selfie', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING },
    selfieUrl: { type: sequelize_1.DataTypes.STRING },
    active: { type: sequelize_1.DataTypes.BOOLEAN },
    appUserId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
});
exports.Selfie = Selfie;
// SelfieMini
const SelfieMini = db_1.default.define('selfieMini', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING },
    selfieUrl: { type: sequelize_1.DataTypes.STRING },
    active: { type: sequelize_1.DataTypes.BOOLEAN },
    appUserId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
});
exports.SelfieMini = SelfieMini;
// UserAlbum
const UserAlbum = db_1.default.define('userAlbum', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: sequelize_1.DataTypes.INTEGER },
    userName: { type: sequelize_1.DataTypes.STRING },
    albumId: { type: sequelize_1.DataTypes.INTEGER },
    isPaid: { type: sequelize_1.DataTypes.BOOLEAN },
});
exports.UserAlbum = UserAlbum;
// Photo_Person
const Photo_Person = db_1.default.define('Photo_Person', {
    photoId: { type: sequelize_1.DataTypes.INTEGER },
    personId: { type: sequelize_1.DataTypes.INTEGER },
});
exports.Photo_Person = Photo_Person;
// Photographer & Album
Photographer.hasMany(Album, {
    sourceKey: 'id',
    foreignKey: 'photographerId',
    as: 'albums',
});
Album.belongsTo(Photographer, {
    foreignKey: 'photographerId',
    as: 'photographer',
});
// Photographer & Photo
Photographer.hasMany(Photo, {
    sourceKey: 'id',
    foreignKey: 'photographerId',
    as: 'photos',
});
Photo.belongsTo(Photographer, {
    foreignKey: 'photographerId',
    as: 'photographer',
});
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


/***/ }),

/***/ "aws-sdk":
/*!**************************!*\
  !*** external "aws-sdk" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("aws-sdk");

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("dotenv");

/***/ }),

/***/ "dotenv/config":
/*!********************************!*\
  !*** external "dotenv/config" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("dotenv/config");

/***/ }),

/***/ "jimp/es":
/*!**************************!*\
  !*** external "jimp/es" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("jimp/es");

/***/ }),

/***/ "pg":
/*!*********************!*\
  !*** external "pg" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("pg");

/***/ }),

/***/ "sequelize":
/*!****************************!*\
  !*** external "sequelize" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("sequelize");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./lambdas/selfieLambda/selfieLambda.ts");
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;
//# sourceMappingURL=selfieLambda.js.map