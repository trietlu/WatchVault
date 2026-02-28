import { Router } from 'express';
import multer from 'multer';
import { uploadFile } from '../controllers/file.controller.js';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env.js';

// Ensure uploads directory exists
const uploadDir = env.uploadsDir;
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

const router = Router();

router.post('/upload', upload.single('file'), uploadFile);

export default router;
