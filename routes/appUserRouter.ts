import express from 'express'
import appUserValidator from '../validator/userValidator'

import telegramController from '../controllers/userController/telegramController'
import paymentController from '../controllers/userController/paymentController'
import userAccountController from '../controllers/userController/userAccountController'
import photoController from '../controllers/userController/photoController'
import selfieController from '../controllers/userController/selfieController'
import albumCotroller from '../controllers/userController/albumCotroller'

import checkAuth from '../middleware/authMiddleware'
import checkValidationErrors from '../middleware/validationErrorsMiddleware'

const router = express.Router()

// login and auth routes
router.post(
	'/send-otp',
	appUserValidator.checkGetOTP(),
	checkValidationErrors,
	telegramController.generateOTP
)
router.get(
	'/check-otp',
	appUserValidator.checkOTP(),
	telegramController.checkOTP
)
router.post(
	'/create-app-user',
	appUserValidator.checkCreateAppUser(),
	checkValidationErrors,
	userAccountController.createAppUser
)
router.get('/get-me', userAccountController.getMe)

// selfie routes
router.post(
	'/presigned-post',
	checkAuth,
	appUserValidator.checkGetPresignedUrl(),
	checkValidationErrors,
	selfieController.signSelfie
)
router.get(
	'/get-selfie',
	checkAuth,
	appUserValidator.checkGetSelfie(),
	checkValidationErrors,
	selfieController.getSelfie
)
router.post(
	'/get-signed-selfie',
	checkAuth,
	appUserValidator.checkPresignedGetSelfie(),
	checkValidationErrors,
	selfieController.createPresignedGetForSelfie
)

// edit user`s info routes
router.put(
	'/edit-notification-settings',
	checkAuth,
	appUserValidator.checkEditNotificationSettings(),
	checkValidationErrors,
	userAccountController.editNotificationSettings
)
router.put(
	'/edit-name',
	checkAuth,
	appUserValidator.checkEditName(),
	checkValidationErrors,
	userAccountController.editName
)
router.put(
	'/edit-phone',
	checkAuth,
	appUserValidator.checkEditPhone(),
	checkValidationErrors,
	userAccountController.editPhone
)
router.put(
	'/edit-email',
	checkAuth,
	appUserValidator.checkEditEmail(),
	checkValidationErrors,
	userAccountController.editEmail
)

// user photos routes
router.get(
	'/get-albums-with-person',
	checkAuth,
	appUserValidator.checkGetAlbumsWithPerson(),
	checkValidationErrors,
	albumCotroller.getAlbumsWithPerson
)
router.get(
	'/get-original-photo',
	checkAuth,
	appUserValidator.checkGetOriginalPhoto(),
	checkValidationErrors,
	photoController.getOriginalPhoto
)

// payment routes
router.get(
	'/generate-payment',
	checkAuth,
	appUserValidator.checkGeneratePayment(),
	checkValidationErrors,
	paymentController.generatePayment
)
router.post(
	'/webhook',
	express.raw({ type: 'application/json' }),
	paymentController.webhook
)

export default router
