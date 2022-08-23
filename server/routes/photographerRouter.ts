import express from 'express';

import photographerController from '../controllers/photographerController';

const router = express.Router();

router.post('/login', photographerController.login);

export default router;
