import { Router } from 'express';
import { createWatch, getWatches, getWatchDetail, addEvent, uploadWatchImage, deleteWatchImage } from '../controllers/watch.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.post('/', authenticateToken, upload.single('image'), createWatch);
router.get('/', authenticateToken, getWatches);
router.get('/:id', authenticateToken, getWatchDetail);
router.post('/:id/events', authenticateToken, addEvent);
router.post('/:id/images', authenticateToken, upload.single('image'), uploadWatchImage);
router.delete('/:id/images/:fileId', authenticateToken, deleteWatchImage);

export default router;
