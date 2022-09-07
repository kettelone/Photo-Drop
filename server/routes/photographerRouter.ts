import express from 'express';

import photographerController from '../controllers/photographerController';
import checkAuth from '../middleware/authMiddleware';

const router = express.Router();

router.post('/login', photographerController.login);
router.post('/create-album', checkAuth, photographerController.createAlbum);
router.post('/s3-upload', checkAuth, photographerController.signOne);
router.post('/add-person-to-photo', checkAuth, photographerController.addPersonToPhoto);
router.post('/get-signed-photos', checkAuth, photographerController.createPresignedGetForPhotos);
router.post('/create-person', checkAuth, photographerController.createPerson);
router.get('/get-all-people', checkAuth, photographerController.getAllPeople);
router.get('/get-albums-from-db', checkAuth, photographerController.getAlbums);
router.get('/get-photos-from-db', checkAuth, photographerController.getPhotos);
export default router;
