import multer from 'multer';
import { AppError } from '../utils/error.js';
import type { Request } from 'express';
import {uploadRules} from "../config/uploadRules.js"



const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,      
  cb: multer.FileFilterCallback
) => {
  if ((uploadRules.ALLOWED_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('صيغة الملف غير مدعومة — المسموح: JPEG, PNG, WEBP', 422) as any);
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadRules.MAX_FILE_SIZE,
    files: uploadRules.MAX_FILES, // max 20 images per request — BR-006
  },
}).array('images', uploadRules.MAX_FILES);

export const uploadSingleMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadRules.MAX_FILE_SIZE,
    files: 1,
  },
}).single('image');