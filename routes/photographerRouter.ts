import express from 'express'
import photoController from '../controllers/photographerController/photoController'
import authController from '../controllers/photographerController/authController'
import albumController from '../controllers/photographerController/albumController'
import peopleController from '../controllers/photographerController/peopleController'
import checkAuth from '../middleware/authMiddleware'
import checkValidationErrors from '../middleware/validationErrorsMiddleware'
import photographerValidator from '../validator/photographerValidator'

const router = express.Router()
// TO DO:combine /get-albums-from-db && get-albums-thumbnail-icons && get-photos-from-db && get-signed-photos
// in one route

// login and auth routes
router.post(
	'/login',
	photographerValidator.checkLogin(),
	checkValidationErrors,
	authController.login
)
router.get('/get-me', authController.getMe)

// album route
router.post(
	'/create-album',
	checkAuth,
	photographerValidator.checkCreateAlbum(),
	checkValidationErrors,
	albumController.createAlbum
)
// /get-albums-from-db and  /get-albums-thumbnail-icons combined into one route
// TO DO: delete /get-albums-thumbnail-icons route after Alexey implemets changes
router.get(
	'/get-albums-from-db',
	checkAuth,
	photographerValidator.checkGetAlbum(),
	checkValidationErrors,
	albumController.getAlbums
)
router.post(
	'/get-albums-thumbnail-icons',
	checkAuth,
	photographerValidator.checkGetAlbumsThumbnailIcon(),
	checkValidationErrors,
	albumController.getAlbumsThumbnailIcon
)

// photo routes
// /get-photos-from-db and  /get-signed-photos combined into one route
// TO DO: delete /get-signed-photos route after Alexey implemets changes
router.get(
	'/get-photos-from-db',
	checkAuth,
	photographerValidator.checkGetPhotos(),
	checkValidationErrors,
	photoController.getPhotos
)
router.post(
	'/get-signed-photos',
	checkAuth,
	photographerValidator.checkGetSignedPhotos(),
	checkValidationErrors,
	photoController.getPhotos
)

router.post(
	'/s3-upload',
	checkAuth,
	photographerValidator.checkS3Upload(),
	checkValidationErrors,
	photoController.signPhotos
)

// get people router
router.get('/get-all-people', checkAuth, peopleController.getAllPeople)

export default router
