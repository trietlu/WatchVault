import multer from 'multer';
import path from 'path';
import { ensureUploadsDirectory } from '../lib/uploads.js';

const uploadDirectory = ensureUploadsDirectory('watches');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to accept only images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
    }
};

// Create multer instance
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 8 * 1024 * 1024, // 8MB max file size
    },
    fileFilter: fileFilter
});
