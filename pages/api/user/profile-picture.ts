import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '@/lib/middlewares';
import { uploadToS3 } from '@/services/s3';
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from '@/lib/api/response';
import { User } from '@/lib/models/user';
import { initializeDbConnection } from '@/lib/db';

// Configure Multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type! Only JPEG, PNG, and GIF are allowed.'));
    }
    cb(null, true);
  },
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, 'Method Not Allowed', HttpStatus.METHOD_NOT_ALLOWED), String(req.url))
  }

  try {

    await initializeDbConnection()

    const user = await User.findById<IUser>(req.user?.userId)
    if (!user) {
      return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, 'User not found', HttpStatus.BAD_REQUEST), String(req.url))
    }

    // Process file upload
    await new Promise<void>((resolve, reject) => {
      upload.single('picture')(req as any, res as any, (err: unknown) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const file = (req as any).file;
    if (!file) {
      return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, 'No file uploaded', HttpStatus.BAD_REQUEST), String(req.url))
    }
    if (file.size > 5 * 1024 * 1024) {
      return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, 'File size exceeds 5MB limit', HttpStatus.BAD_REQUEST), String(req.url))
    }

    // Generate unique file name and upload to S3
    const fileExtension = file.mimetype.split('/')[1];
    const fileName = `profile_pictures/${uuidv4()}.${fileExtension}`;
    const s3Url = await uploadToS3(fileName, file.buffer, file.mimetype, true);

    const updatedUser = await User.findByIdAndUpdate(
      req.user?.userId,
      { $set: {profilePicture: s3Url} },
      { new: true, runValidators: true }
    )
    // Not to worry this wont return any sensitive fields
    return formatApiResponse(res, {user: updatedUser, url: s3Url}, String(req.url))
  } catch (error: any) {
    console.error('Upload Error:', error);
    return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, "Error occured while saving your profile picture", HttpStatus.BAD_REQUEST), String(req.url))
  }
}

// Disable automatic body parsing in Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export default authMiddleware(handler);