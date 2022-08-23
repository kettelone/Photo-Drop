import express from 'express';
import albumController from '../controllers/albumController';

const router = express.Router();

router.post('/create-album', albumController.createAlbum);
router.post('/save-to-database', albumController.uploadPhotosToDB);
router.post('/s3-upload', albumController.signOne);

export default router;
