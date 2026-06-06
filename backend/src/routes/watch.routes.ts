import { Router } from 'express';
import { createWatch, getWatches, getWatchDetail, addEvent, uploadWatchImage, deleteWatchImage, uploadContractDocument, getWatchImageContent } from '../controllers/watch.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { contractUpload, upload } from '../middleware/upload.middleware.js';

const router = Router();

router.post('/', authenticateToken, upload.single('image'), createWatch);
router.get('/', authenticateToken, getWatches);
router.get('/:id', authenticateToken, getWatchDetail);
router.post('/:id/events', authenticateToken, addEvent);
router.post('/:id/contracts', authenticateToken, contractUpload.single('contract'), uploadContractDocument);
router.post('/:id/images', authenticateToken, upload.single('image'), uploadWatchImage);
router.get('/:id/images/:fileId/content', authenticateToken, getWatchImageContent);
router.delete('/:id/images/:fileId', authenticateToken, deleteWatchImage);

export default router;
