/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(1);
// @ts-ignore
var aws_sdk_1 = __webpack_require__(2);
// @ts-ignore
var jimp_1 = __webpack_require__(3);
var axios_1 = __webpack_require__(4);
var model_1 = __webpack_require__(5);
// get reference to S3 client
var s3 = new aws_sdk_1.default.S3();
var baseHandler = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var srcBucket, srcKey, paramsS3, data, metadata, peopleString, peopleArray, dstBucket, dstBucketWM, dstKey, dstKeyWM, idEnd, photographerId, albumIdStart, albumIdEnd, albumId, urlPhoto, photo, photoId, i, personExist, person, e_1, e_2, typeMatch, imageType, origimage, params, error_1, width, buffer, error_2, destparams, putResult, urlPhotoMini, e_3, e_4, error_3, addWaterMark, imageWM, destparamsWM, putResultWM, urlPhotoMiniWaterMark, e_5, e_6, phoneNumbers, arrLength, i, user, uri, response, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                srcBucket = event.Records[0].s3.bucket.name;
                srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
                paramsS3 = {
                    Bucket: srcBucket,
                    Key: srcKey,
                };
                return [4 /*yield*/, s3.headObject(paramsS3).promise()];
            case 1:
                data = _a.sent();
                metadata = (!data) ? null : data.Metadata;
                if (!metadata) {
                    return [2 /*return*/];
                }
                peopleString = metadata.people;
                peopleArray = peopleString.split(',');
                dstBucket = "".concat(srcBucket, "-resized");
                dstBucketWM = "".concat(srcBucket, "-resized-watermark");
                dstKey = "resized-".concat(srcKey);
                dstKeyWM = "resized-watermark".concat(dstKey);
                idEnd = srcKey.indexOf('/');
                photographerId = Number(srcKey.substring(0, idEnd));
                albumIdStart = srcKey.substring(idEnd + 1);
                albumIdEnd = albumIdStart.indexOf('/');
                albumId = Number("".concat(albumIdStart.substring(0, albumIdEnd)));
                urlPhoto = "https://".concat(srcBucket, ".s3.eu-west-1.amazonaws.com/").concat(srcKey);
                _a.label = 2;
            case 2:
                _a.trys.push([2, 17, , 18]);
                return [4 /*yield*/, model_1.Photo.create({
                        name: srcKey, photoUrl: urlPhoto,
                        photographerId: photographerId,
                        albumId: albumId,
                    })];
            case 3:
                photo = _a.sent();
                if (!photo) return [3 /*break*/, 15];
                photoId = photo.dataValues.id;
                i = 0;
                _a.label = 4;
            case 4:
                if (!(i < peopleArray.length)) return [3 /*break*/, 14];
                _a.label = 5;
            case 5:
                _a.trys.push([5, 12, , 13]);
                return [4 /*yield*/, model_1.Person.findOne({ where: { phone: peopleArray[i] } })];
            case 6:
                personExist = _a.sent();
                if (!(personExist === null)) return [3 /*break*/, 9];
                return [4 /*yield*/, model_1.Person.create({
                        phone: peopleArray[i],
                        photoId: photoId,
                    })];
            case 7:
                person = _a.sent();
                // @ts-ignore
                return [4 /*yield*/, person.addPhoto(photo)];
            case 8:
                // @ts-ignore
                _a.sent();
                return [3 /*break*/, 11];
            case 9: 
            // @ts-ignore
            return [4 /*yield*/, personExist.addPhoto(photo)];
            case 10:
                // @ts-ignore
                _a.sent();
                _a.label = 11;
            case 11: return [3 /*break*/, 13];
            case 12:
                e_1 = _a.sent();
                console.log(e_1);
                return [3 /*break*/, 13];
            case 13:
                i += 1;
                return [3 /*break*/, 4];
            case 14:
                console.log('Successfully uploaded');
                return [3 /*break*/, 16];
            case 15:
                console.log({ message: 'Photo was not found' });
                _a.label = 16;
            case 16: return [3 /*break*/, 18];
            case 17:
                e_2 = _a.sent();
                console.log(e_2);
                return [2 /*return*/];
            case 18:
                typeMatch = srcKey.match(/\.([^.]*)$/);
                if (!typeMatch) {
                    console.log('Could not determine the image type.');
                    return [2 /*return*/];
                }
                imageType = typeMatch[1].toLowerCase();
                if (imageType !== 'jpg' && imageType !== 'png' && imageType !== 'jpeg') {
                    console.log("Unsupported image type: ".concat(imageType));
                    return [2 /*return*/];
                }
                _a.label = 19;
            case 19:
                _a.trys.push([19, 21, , 22]);
                params = {
                    Bucket: srcBucket,
                    Key: srcKey,
                };
                return [4 /*yield*/, s3.getObject(params).promise()];
            case 20:
                origimage = _a.sent();
                return [3 /*break*/, 22];
            case 21:
                error_1 = _a.sent();
                console.log(error_1);
                return [2 /*return*/];
            case 22:
                width = 400;
                _a.label = 23;
            case 23:
                _a.trys.push([23, 25, , 26]);
                return [4 /*yield*/, jimp_1.default.read(origimage.Body).resize(width)];
            case 24:
                // @ts-ignore
                buffer = _a.sent();
                return [3 /*break*/, 26];
            case 25:
                error_2 = _a.sent();
                console.log(error_2);
                return [2 /*return*/];
            case 26:
                _a.trys.push([26, 36, , 37]);
                destparams = {
                    Bucket: dstBucket,
                    Key: dstKey,
                    Body: buffer,
                    ContentType: 'image',
                };
                return [4 /*yield*/, s3.putObject(destparams).promise()];
            case 27:
                putResult = _a.sent();
                if (!putResult) return [3 /*break*/, 35];
                _a.label = 28;
            case 28:
                _a.trys.push([28, 33, , 34]);
                urlPhotoMini = "https://".concat(dstBucket, ".s3.eu-west-1.amazonaws.com/").concat(srcKey);
                _a.label = 29;
            case 29:
                _a.trys.push([29, 31, , 32]);
                return [4 /*yield*/, model_1.PhotoMini.create({
                        name: srcKey, photoMiniUrl: urlPhotoMini,
                        photographerId: photographerId,
                        albumId: albumId,
                    })];
            case 30:
                _a.sent();
                return [3 /*break*/, 32];
            case 31:
                e_3 = _a.sent();
                console.log(e_3);
                return [2 /*return*/];
            case 32: return [3 /*break*/, 34];
            case 33:
                e_4 = _a.sent();
                console.log(e_4);
                return [2 /*return*/];
            case 34:
                console.log("Successfully resized ".concat(srcBucket, "/").concat(srcKey, " and uploaded to ").concat(dstBucket, "/").concat(dstKey));
                console.log('METADATA IS:   ', metadata);
                _a.label = 35;
            case 35: return [3 /*break*/, 37];
            case 36:
                error_3 = _a.sent();
                console.log(error_3);
                return [2 /*return*/];
            case 37:
                _a.trys.push([37, 53, , 54]);
                addWaterMark = function (image) { return __awaiter(void 0, void 0, void 0, function () {
                    var logoImage, resizeWidth, imageResized, img;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, jimp_1.default.read('./PhotoDropLogo.png')];
                            case 1:
                                logoImage = _a.sent();
                                resizeWidth = 400;
                                if (!image) {
                                    return [2 /*return*/];
                                }
                                return [4 /*yield*/, jimp_1.default.read(image)];
                            case 2:
                                imageResized = _a.sent();
                                imageResized = imageResized.resize(resizeWidth, resizeWidth);
                                return [4 /*yield*/, jimp_1.default.read(imageResized)];
                            case 3:
                                img = _a.sent();
                                img.composite(logoImage, img.bitmap.width / 2 - logoImage.bitmap.width / 2, img.bitmap.height / 2 - logoImage.bitmap.height / 2);
                                return [2 /*return*/, img.getBufferAsync(jimp_1.default.MIME_JPEG)];
                        }
                    });
                }); };
                return [4 /*yield*/, addWaterMark(origimage.Body)];
            case 38:
                imageWM = _a.sent();
                destparamsWM = {
                    Bucket: dstBucketWM,
                    Key: dstKeyWM,
                    Body: imageWM,
                    ContentType: 'image',
                };
                return [4 /*yield*/, s3.putObject(destparamsWM).promise()];
            case 39:
                putResultWM = _a.sent();
                if (!putResultWM) return [3 /*break*/, 47];
                _a.label = 40;
            case 40:
                _a.trys.push([40, 45, , 46]);
                urlPhotoMiniWaterMark = "https://".concat(dstBucketWM, ".s3.eu-west-1.amazonaws.com/").concat(srcKey);
                _a.label = 41;
            case 41:
                _a.trys.push([41, 43, , 44]);
                return [4 /*yield*/, model_1.PhotoMiniWaterMark.create({
                        name: srcKey, photoMiniWaterMarkUrl: urlPhotoMiniWaterMark,
                        photographerId: photographerId,
                        albumId: albumId,
                    })];
            case 42:
                _a.sent();
                return [3 /*break*/, 44];
            case 43:
                e_5 = _a.sent();
                console.log(e_5);
                return [2 /*return*/];
            case 44: return [3 /*break*/, 46];
            case 45:
                e_6 = _a.sent();
                console.log(e_6);
                return [2 /*return*/];
            case 46:
                console.log("Successfully resized with matermark".concat(srcBucket, "/").concat(srcKey, " and uploaded to ").concat(dstBucketWM, "/").concat(dstKeyWM));
                _a.label = 47;
            case 47:
                phoneNumbers = peopleArray;
                if (!phoneNumbers) return [3 /*break*/, 52];
                arrLength = phoneNumbers.length;
                i = 0;
                _a.label = 48;
            case 48:
                if (!(i < arrLength)) return [3 /*break*/, 52];
                return [4 /*yield*/, model_1.AppUser.findOne({ where: { phone: phoneNumbers[i] } })];
            case 49:
                user = _a.sent();
                console.log({ user: user });
                if (!user) return [3 /*break*/, 51];
                uri = encodeURI("https://api.telegram.org/bot5620754624:AAECaxHAR6n5ITV14KjCpP-JPGCrFKcCRjY/sendMessage?chat_id=-678774504&text=PhotoDrop:".concat(phoneNumbers[i], " your photos have dropped\uD83D\uDD25\n\nCheck them out here:\n https://userAppUrlWillBeSoonHere.com"));
                return [4 /*yield*/, (0, axios_1.default)({
                        method: 'get',
                        url: uri,
                    })];
            case 50:
                response = _a.sent();
                console.log({ response: response });
                _a.label = 51;
            case 51:
                i += 1;
                return [3 /*break*/, 48];
            case 52: return [3 /*break*/, 54];
            case 53:
                error_4 = _a.sent();
                console.log(error_4);
                return [3 /*break*/, 54];
            case 54: return [2 /*return*/];
        }
    });
}); };
// @ts-ignore
var handler = baseHandler;
module.exports.handler = handler;


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("dotenv/config");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("aws-sdk");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("jimp");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("axios");

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserAlbum = exports.PhotoMiniWaterMark_Person = exports.PhotoMini_Person = exports.Photo_Person = exports.SelfieMini = exports.Selfie = exports.AppUser = exports.Person = exports.PhotoMiniWaterMark = exports.PhotoMini = exports.Photo = exports.Album = exports.Photographer = void 0;
var sequelize_1 = __webpack_require__(6); // с помощью DataTypes описываются типы поля(String, Int,  Array ect.)
var db_1 = __webpack_require__(7);
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
var Photographer = db_1.default.define('photographer', {
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
var Album = db_1.default.define('album', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    location: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    date: { type: sequelize_1.DataTypes.DATE, allowNull: false },
});
exports.Album = Album;
var Photo = db_1.default.define('photo', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING },
    photoUrl: { type: sequelize_1.DataTypes.STRING },
});
exports.Photo = Photo;
var PhotoMini = db_1.default.define('photoMini', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING },
    photoMiniUrl: { type: sequelize_1.DataTypes.STRING },
});
exports.PhotoMini = PhotoMini;
var PhotoMiniWaterMark = db_1.default.define('photoMiniWaterMark', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING },
    photoMiniWaterMarkUrl: { type: sequelize_1.DataTypes.STRING },
});
exports.PhotoMiniWaterMark = PhotoMiniWaterMark;
var Person = db_1.default.define('person', {
    id: {
        type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true,
    },
    phone: { type: sequelize_1.DataTypes.STRING, unique: true },
    name: { type: sequelize_1.DataTypes.STRING },
});
exports.Person = Person;
var AppUser = db_1.default.define('appUser', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING },
    phone: { type: sequelize_1.DataTypes.STRING, unique: true },
    email: { type: sequelize_1.DataTypes.STRING, unique: true },
    textMessagesNotification: { type: sequelize_1.DataTypes.BOOLEAN },
    emailNotification: { type: sequelize_1.DataTypes.BOOLEAN },
    unsubscribe: { type: sequelize_1.DataTypes.BOOLEAN },
});
exports.AppUser = AppUser;
var Selfie = db_1.default.define('selfie', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING },
    selfieUrl: { type: sequelize_1.DataTypes.STRING },
    active: { type: sequelize_1.DataTypes.BOOLEAN },
});
exports.Selfie = Selfie;
var SelfieMini = db_1.default.define('selfieMini', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING },
    selfieUrl: { type: sequelize_1.DataTypes.STRING },
    active: { type: sequelize_1.DataTypes.BOOLEAN },
});
exports.SelfieMini = SelfieMini;
var UserAlbum = db_1.default.define('userAlbum', {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: sequelize_1.DataTypes.INTEGER },
    userName: { type: sequelize_1.DataTypes.STRING },
    albumId: { type: sequelize_1.DataTypes.INTEGER },
    isPaid: { type: sequelize_1.DataTypes.BOOLEAN },
});
exports.UserAlbum = UserAlbum;
var Photo_Person = db_1.default.define('Photo_Person', {
    photoId: { type: sequelize_1.DataTypes.INTEGER },
    personId: { type: sequelize_1.DataTypes.INTEGER },
});
exports.Photo_Person = Photo_Person;
var PhotoMini_Person = db_1.default.define('PhotoMini_Person', {
    photoMiniId: { type: sequelize_1.DataTypes.INTEGER },
    personId: { type: sequelize_1.DataTypes.INTEGER },
});
exports.PhotoMini_Person = PhotoMini_Person;
var PhotoMiniWaterMark_Person = db_1.default.define('PhotoMiniWaterMark_Person', {
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
/* 6 */
/***/ ((module) => {

module.exports = require("sequelize");

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
var dotenv_1 = __webpack_require__(8);
var sequelize_1 = __webpack_require__(6);
dotenv_1.default.config();
var sequelize = new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'postgres',
    define: {
        timestamps: false,
    },
});
exports["default"] = sequelize;


/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("dotenv");

/***/ })
/******/ 	]);
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
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;