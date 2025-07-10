import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { UseInterceptors } from '@nestjs/common';

export const getMulterUploadInterceptor = () => {
  return UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const userId = (req as any).user?.userId;
          const folder = `${process.cwd()}/uploads/users/${userId}`;


          if (!existsSync(folder)) {
            mkdirSync(folder, { recursive: true });
          }

          if (file.fieldname === 'profileImage') {
            const existingFiles = readdirSync(folder);
            for (const f of existingFiles) {
              if (f.startsWith('profileimage-')) {
                const filePath = join(folder, f);
                try {
                  unlinkSync(filePath);
                } catch (err) {
                  console.error(`Failed to delete existing profileImage:`, err);
                }
              }
            }
          }

          cb(null, folder);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);

          const cleanFieldname = file.fieldname
            .replace(/\s+/g, '')
            .toLowerCase();

          const filename = `${cleanFieldname}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only PDF, PNG, and JPEG files are allowed'), false);
        }
      },
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  );
};
