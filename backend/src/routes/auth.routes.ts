import { Router } from 'express';
import { register, login, googleLogin, facebookLogin, me } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/facebook', facebookLogin);
router.get('/me', authenticateToken, me);

export default router;
