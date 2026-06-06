import multer from 'multer';
import path from 'path';

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
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 8 * 1024 * 1024, // 8MB max file size
    },
    fileFilter: fileFilter
});

const contractFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = new Set([
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
    ]);

    if (allowedMimeTypes.has(file.mimetype)) {
        return cb(null, true);
    }

    cb(new Error('Only PDF and image contract files are allowed'));
};

export const contractUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 16 * 1024 * 1024,
    },
    fileFilter: contractFileFilter,
});
