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
var model_1 = __webpack_require__(4);
// get reference to S3 client
var s3 = new aws_sdk_1.default.S3();
// @ts-ignore
var baseHandler = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var bucket, dstBucket, key, dstKey, params, data, metadata, userid, urlSelfie, oldSelfies, i, selfie, e_1, typeMatch, imageType, origimage, params_1, error_1, width, buffer, error_2, destparams, putResult, urlSelfieMini, oldSelfies, i, e_2, e_3, error_3, err_1, message;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                bucket = event.Records[0].s3.bucket.name;
                dstBucket = "".concat(bucket, "-resized");
                key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
                dstKey = key;
                params = {
                    Bucket: bucket,
                    Key: key,
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 36, , 37]);
                return [4 /*yield*/, s3.getObject(params).promise()];
            case 2:
                data = _a.sent();
                metadata = (!data) ? null : data.Metadata;
                if (!metadata) return [3 /*break*/, 35];
                userid = Number(metadata.userid);
                urlSelfie = "https://".concat(bucket, ".s3.eu-west-1.amazonaws.com/").concat(key);
                console.log('METADATA IS: ', metadata.userid);
                _a.label = 3;
            case 3:
                _a.trys.push([3, 10, , 11]);
                return [4 /*yield*/, model_1.Selfie.findAll({ where: { appUserId: userid } })];
            case 4:
                oldSelfies = _a.sent();
                i = 0;
                _a.label = 5;
            case 5:
                if (!(i < oldSelfies.length)) return [3 /*break*/, 8];
                // @ts-ignore
                oldSelfies[i].active = false;
                // eslint-disable-next-line no-await-in-loop
                return [4 /*yield*/, oldSelfies[i].save()];
            case 6:
                // eslint-disable-next-line no-await-in-loop
                _a.sent();
                _a.label = 7;
            case 7:
                i += 1;
                return [3 /*break*/, 5];
            case 8: return [4 /*yield*/, model_1.Selfie.create({
                    name: key, selfieUrl: urlSelfie, active: true, appUserId: userid,
                })];
            case 9:
                selfie = _a.sent();
                console.log('Selfie is: ', selfie);
                return [3 /*break*/, 11];
            case 10:
                e_1 = _a.sent();
                console.log(e_1);
                return [2 /*return*/];
            case 11:
                typeMatch = key.match(/\.([^.]*)$/);
                if (!typeMatch) {
                    console.log('Could not determine the image type.');
                    return [2 /*return*/];
                }
                imageType = typeMatch[1].toLowerCase();
                if (imageType !== 'jpg' && imageType !== 'png' && imageType !== 'jpeg') {
                    console.log("Unsupported image type: ".concat(imageType));
                    return [2 /*return*/];
                }
                origimage = void 0;
                _a.label = 12;
            case 12:
                _a.trys.push([12, 14, , 15]);
                params_1 = {
                    Bucket: bucket,
                    Key: key,
                };
                return [4 /*yield*/, s3.getObject(params_1).promise()];
            case 13:
                // eslint-disable-next-line vars-on-top, no-var
                origimage = _a.sent();
                return [3 /*break*/, 15];
            case 14:
                error_1 = _a.sent();
                console.log(error_1);
                return [2 /*return*/];
            case 15:
                width = 50;
                buffer = void 0;
                _a.label = 16;
            case 16:
                _a.trys.push([16, 18, , 19]);
                return [4 /*yield*/, jimp_1.default.read(origimage.Body)];
            case 17:
                // @ts-ignore
                buffer = _a.sent();
                buffer = buffer.resize(width, width);
                return [3 /*break*/, 19];
            case 18:
                error_2 = _a.sent();
                console.log(error_2);
                return [2 /*return*/];
            case 19:
                _a.trys.push([19, 33, , 34]);
                destparams = {
                    Bucket: dstBucket,
                    Key: dstKey,
                    Body: buffer,
                    ContentType: 'image',
                };
                return [4 /*yield*/, s3.putObject(destparams).promise()];
            case 20:
                putResult = _a.sent();
                if (!putResult) return [3 /*break*/, 32];
                _a.label = 21;
            case 21:
                _a.trys.push([21, 30, , 31]);
                urlSelfieMini = "https://".concat(dstBucket, ".s3.eu-west-1.amazonaws.com/").concat(dstKey);
                return [4 /*yield*/, model_1.SelfieMini.findAll({ where: { appUserId: userid } })];
            case 22:
                oldSelfies = _a.sent();
                i = 0;
                _a.label = 23;
            case 23:
                if (!(i < oldSelfies.length)) return [3 /*break*/, 26];
                // @ts-ignore
                oldSelfies[i].active = false;
                // eslint-disable-next-line no-await-in-loop
                return [4 /*yield*/, oldSelfies[i].save()];
            case 24:
                // eslint-disable-next-line no-await-in-loop
                _a.sent();
                _a.label = 25;
            case 25:
                i += 1;
                return [3 /*break*/, 23];
            case 26:
                _a.trys.push([26, 28, , 29]);
                return [4 /*yield*/, model_1.SelfieMini.create({
                        name: dstKey, selfieUrl: urlSelfieMini, active: true, appUserId: userid,
                    })];
            case 27:
                _a.sent();
                return [3 /*break*/, 29];
            case 28:
                e_2 = _a.sent();
                console.log(e_2);
                return [2 /*return*/];
            case 29: return [3 /*break*/, 31];
            case 30:
                e_3 = _a.sent();
                console.log(e_3);
                return [2 /*return*/];
            case 31:
                console.log("Successfully resized ".concat(bucket, "/").concat(key, " and uploaded to ").concat(dstBucket, "/").concat(dstKey));
                _a.label = 32;
            case 32: return [3 /*break*/, 34];
            case 33:
                error_3 = _a.sent();
                console.log(error_3);
                return [2 /*return*/];
            case 34: return [2 /*return*/];
            case 35: return [3 /*break*/, 37];
            case 36:
                err_1 = _a.sent();
                console.log(err_1);
                message = "Error getting object ".concat(key, " from bucket ").concat(bucket, ". Make sure they exist and your bucket is in the same region as this function.");
                console.log(message);
                throw new Error(message);
            case 37: return [2 /*return*/];
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
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserAlbum = exports.PhotoMiniWaterMark_Person = exports.PhotoMini_Person = exports.Photo_Person = exports.SelfieMini = exports.Selfie = exports.AppUser = exports.Person = exports.PhotoMiniWaterMark = exports.PhotoMini = exports.Photo = exports.Album = exports.Photographer = void 0;
var sequelize_1 = __webpack_require__(5); // с помощью DataTypes описываются типы поля(String, Int,  Array ect.)
var db_1 = __webpack_require__(6);
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
/* 5 */
/***/ ((module) => {

module.exports = require("sequelize");

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
var dotenv_1 = __webpack_require__(7);
var sequelize_1 = __webpack_require__(5);
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
/* 7 */
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