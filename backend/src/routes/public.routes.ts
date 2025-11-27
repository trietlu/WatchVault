import { Router } from 'express';
import { getPassport } from '../controllers/public.controller.js';

const router = Router();

router.get('/:publicId', getPassport);

export default router;
