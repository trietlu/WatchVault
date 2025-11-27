import { Router } from 'express';
import { register, login, googleLogin, facebookLogin } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/facebook', facebookLogin);

export default router;
