/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./lambdas/originalPhotosLambda/PhotoDropLogo.png":
/*!********************************************************!*\
  !*** ./lambdas/originalPhotosLambda/PhotoDropLogo.png ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "d8885004a7cbbc5c2de6177b99b30489.png");

/***/ }),

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

/***/ "./lambdas/originalPhotosLambda/originalPhotosLambda.ts":
/*!**************************************************************!*\
  !*** ./lambdas/originalPhotosLambda/originalPhotosLambda.ts ***!
  \**************************************************************/
/***/ (function(module, exports, __webpack_require__) {


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
__webpack_require__(/*! dotenv/config */ "dotenv/config");
const aws_sdk_1 = __importDefault(__webpack_require__(/*! aws-sdk */ "aws-sdk"));
const jimp_1 = __importDefault(__webpack_require__(/*! jimp */ "jimp"));
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "axios"));
const model_1 = __webpack_require__(/*! ../../models/model */ "./models/model.ts");
const photoDropLogo = __importStar(__webpack_require__(/*! ./PhotoDropLogo.png */ "./lambdas/originalPhotosLambda/PhotoDropLogo.png"));
/*
1.To import photoDropLogo index.d.ts has to be created and "*.png" has to be initiated and exported
*/
// get reference to S3 client
const s3 = new aws_sdk_1.default.S3();
const baseHandler = async (event) => {
    if (!photoDropLogo) {
        return;
    }
    const srcBucket = event.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    // for obtainig the meta data for the bucket and key
    const paramsS3 = {
        Bucket: srcBucket,
        Key: srcKey,
    };
    const data = await s3.headObject(paramsS3).promise();
    const metadata = (!data) ? null : data.Metadata;
    if (!metadata) {
        return;
    }
    const peopleString = metadata.people;
    const peopleArray = peopleString.split(',');
    const dstBucket = `${srcBucket}-resized`;
    const dstBucketWM = `${srcBucket}-resized-watermark`;
    const dstKey = `resized-${srcKey}`;
    const dstKeyWM = `resized-watermark${dstKey}`;
    // save original photo info to db
    const idEnd = srcKey.indexOf('/');
    const photographerId = Number(srcKey.substring(0, idEnd));
    // 1/1/491e9200-155e-4a19-8935-307b98fc3841_laptop.jpg
    const albumIdStart = srcKey.substring(idEnd + 1);
    const albumIdEnd = albumIdStart.indexOf('/');
    const albumId = Number(`${albumIdStart.substring(0, albumIdEnd)}`);
    const urlPhoto = `https://${srcBucket}.s3.eu-west-1.amazonaws.com/${srcKey}`;
    try {
        const photo = await model_1.Photo.create({
            name: srcKey, photoUrl: urlPhoto, photographerId, albumId,
        });
        if (photo) {
            // @ts-ignore
            const photoId = photo.dataValues.id;
            for (let i = 0; i < peopleArray.length; i += 1) {
                try {
                    // eslint-disable-next-line no-await-in-loop
                    const personExist = await model_1.Person.findOne({ where: { phone: peopleArray[i] } });
                    if (personExist === null) {
                        /* eslint-disable no-await-in-loop */
                        const person = await model_1.Person.create({
                            phone: peopleArray[i],
                            photoId,
                        });
                        // @ts-ignore
                        await person.addPhoto(photo);
                    }
                    else {
                        // @ts-ignore
                        await personExist.addPhoto(photo);
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }
            console.log('Successfully uploaded');
        }
        else {
            console.log({ message: 'Photo was not found' });
        }
    }
    catch (e) {
        console.log(e);
        return;
    }
    // Infer the image type from the file suffix.
    const typeMatch = srcKey.match(/\.([^.]*)$/);
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
        const params = {
            Bucket: srcBucket,
            Key: srcKey,
        };
        origimage = await s3.getObject(params).promise();
    }
    catch (error) {
        console.log(error);
        return;
    }
    // set thumbnail width. Resize will set the height automatically to maintain aspect ratio.
    const width = 400;
    // Use the sharp module to resize the image and save in a buffer.
    let buffer;
    try {
        // @ts-ignore
        buffer = await jimp_1.default.read(origimage.Body).then((image) => {
            const resizedImage = image
                .resize(width, jimp_1.default.AUTO)
                .quality(100) // set JPEG quality
                .getBufferAsync(jimp_1.default.MIME_JPEG);
            return resizedImage;
        });
        // buffer = await sharp(origimage.Body).resize(width).toBuffer();
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
                const urlPhotoMini = `https://${dstBucket}.s3.eu-west-1.amazonaws.com/${srcKey}`;
                try {
                    await model_1.PhotoMini.create({
                        name: srcKey, photoMiniUrl: urlPhotoMini, photographerId, albumId,
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
            console.log(`Successfully resized ${srcBucket}/${srcKey} and uploaded to ${dstBucket}/${dstKey}`);
            console.log('METADATA IS:   ', metadata);
        }
    }
    catch (error) {
        console.log(error);
        return;
    }
    try {
        // add watermark add upload to photodropbucket-resized-watermark
        const addWaterMark = async (image) => {
            /*
            2.After importing the  photoDropLogo and deploying with "serverless deploy" command
              photoDropLogo image will be present in zip package file
              under the name "d8885004a7cbbc5c2de6177b99b30489.png"
              (have no idea why this name. I was trying tix it with no success.)
      
              So later on we will read image using name mentioned above. The path will be
              "./d8885004a7cbbc5c2de6177b99b30489.png" - chekc zip file manually to double check
            */
            const logoImage = await jimp_1.default.read('./d8885004a7cbbc5c2de6177b99b30489.png');
            const resizeWidth = 400;
            if (!image) {
                return;
            }
            let imageResized = await jimp_1.default.read(image);
            imageResized = imageResized.resize(resizeWidth, jimp_1.default.AUTO);
            // const imageResized = await sharp(image).resize(resizeWidth).toBuffer();
            const img = await jimp_1.default.read(imageResized);
            img.composite(logoImage, img.bitmap.width / 2 - logoImage.bitmap.width / 2, img.bitmap.height / 2 - logoImage.bitmap.height / 2);
            return img.getBufferAsync(jimp_1.default.MIME_JPEG);
        };
        const imageWM = await addWaterMark(origimage.Body);
        const destparamsWM = {
            Bucket: dstBucketWM,
            Key: dstKeyWM,
            Body: imageWM,
            ContentType: 'image',
        };
        const putResultWM = await s3.putObject(destparamsWM).promise();
        if (putResultWM) {
            try {
                // save resized photo info to db
                const urlPhotoMiniWaterMark = `https://${dstBucketWM}.s3.eu-west-1.amazonaws.com/${srcKey}`;
                try {
                    await model_1.PhotoMiniWaterMark.create({
                        name: srcKey, photoMiniWaterMarkUrl: urlPhotoMiniWaterMark, photographerId, albumId,
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
            console.log(`Successfully resized with matermark${srcBucket}/${srcKey} and uploaded to ${dstBucketWM}/${dstKeyWM}`);
        }
        // notify(in telegram) app user that photo has been uploaded
        const phoneNumbers = peopleArray;
        if (phoneNumbers) {
            const arrLength = phoneNumbers.length;
            for (let i = 0; i < arrLength; i += 1) {
                const user = await model_1.AppUser.findOne({ where: { phone: phoneNumbers[i] } });
                console.log({ user });
                if (user) {
                    const uri = encodeURI(`https://api.telegram.org/bot5620754624:AAECaxHAR6n5ITV14KjCpP-JPGCrFKcCRjY/sendMessage?chat_id=-678774504&text=PhotoDrop:${phoneNumbers[i]} your photos have dropped🔥\n\nCheck them out here:\n https://userAppUrlWillBeSoonHere.com`);
                    const response = await (0, axios_1.default)({
                        method: 'get',
                        url: uri,
                    });
                    console.log({ response });
                }
            }
        }
    }
    catch (error) {
        console.log(error);
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
exports.UserAlbum = exports.PhotoMiniWaterMark_Person = exports.PhotoMini_Person = exports.Photo_Person = exports.SelfieMini = exports.Selfie = exports.AppUser = exports.Person = exports.PhotoMiniWaterMark = exports.PhotoMini = exports.Photo = exports.Album = exports.Photographer = void 0;
const sequelize_1 = __webpack_require__(/*! sequelize */ "sequelize"); // с помощью DataTypes описываются типы поля(String, Int,  Array ect.)
const db_1 = __importDefault(__webpack_require__(/*! ../db */ "./db.ts"));
// interface PhotographerAttributes {
// id: number;
// login: string;
// password: string;
// email: string;
// fullName:string
// }
// export class Photographer extends Model<PhotographerAttributes> {}
// Photographer.init(
//   {
//     id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//     login: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//     },
//     password: { type: DataTypes.STRING, allowNull: false },
//     email: { type: DataTypes.STRING },
//     fullName: { type: DataTypes.STRING },
//   },
//   {
//     sequelize,
//     tableName: 'photographers',
//   },
// );
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
const Album = db_1.default.define('album', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    location: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    date: { type: sequelize_1.DataTypes.DATE, allowNull: false },
});
exports.Album = Album;
const Photo = db_1.default.define('photo', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING },
    photoUrl: { type: sequelize_1.DataTypes.STRING },
});
exports.Photo = Photo;
const PhotoMini = db_1.default.define('photoMini', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING },
    photoMiniUrl: { type: sequelize_1.DataTypes.STRING },
});
exports.PhotoMini = PhotoMini;
const PhotoMiniWaterMark = db_1.default.define('photoMiniWaterMark', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING },
    photoMiniWaterMarkUrl: { type: sequelize_1.DataTypes.STRING },
});
exports.PhotoMiniWaterMark = PhotoMiniWaterMark;
const Person = db_1.default.define('person', {
    id: {
        type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true,
    },
    phone: { type: sequelize_1.DataTypes.STRING, unique: true },
    name: { type: sequelize_1.DataTypes.STRING },
});
exports.Person = Person;
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
const Selfie = db_1.default.define('selfie', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING },
    selfieUrl: { type: sequelize_1.DataTypes.STRING },
    active: { type: sequelize_1.DataTypes.BOOLEAN },
});
exports.Selfie = Selfie;
const SelfieMini = db_1.default.define('selfieMini', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING },
    selfieUrl: { type: sequelize_1.DataTypes.STRING },
    active: { type: sequelize_1.DataTypes.BOOLEAN },
});
exports.SelfieMini = SelfieMini;
const UserAlbum = db_1.default.define('userAlbum', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: sequelize_1.DataTypes.INTEGER },
    userName: { type: sequelize_1.DataTypes.STRING },
    albumId: { type: sequelize_1.DataTypes.INTEGER },
    isPaid: { type: sequelize_1.DataTypes.BOOLEAN },
});
exports.UserAlbum = UserAlbum;
const Photo_Person = db_1.default.define('Photo_Person', {
    photoId: { type: sequelize_1.DataTypes.INTEGER },
    personId: { type: sequelize_1.DataTypes.INTEGER },
});
exports.Photo_Person = Photo_Person;
const PhotoMini_Person = db_1.default.define('PhotoMini_Person', {
    photoMiniId: { type: sequelize_1.DataTypes.INTEGER },
    personId: { type: sequelize_1.DataTypes.INTEGER },
});
exports.PhotoMini_Person = PhotoMini_Person;
const PhotoMiniWaterMark_Person = db_1.default.define('PhotoMiniWaterMark_Person', {
    photoMiniWaterMarkId: { type: sequelize_1.DataTypes.INTEGER },
    personId: { type: sequelize_1.DataTypes.INTEGER },
});
exports.PhotoMiniWaterMark_Person = PhotoMiniWaterMark_Person;
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


/***/ }),

/***/ "aws-sdk":
/*!**************************!*\
  !*** external "aws-sdk" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("aws-sdk");

/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/***/ ((module) => {

module.exports = require("axios");

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

/***/ "jimp":
/*!***********************!*\
  !*** external "jimp" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("jimp");

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
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "";
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./lambdas/originalPhotosLambda/originalPhotosLambda.ts");
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;
//# sourceMappingURL=originalPhotosLambda.js.map