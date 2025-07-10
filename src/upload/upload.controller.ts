import {
  Controller,
  Post,
  UploadedFiles,
  HttpException,
  HttpStatus,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { RequestWithUser } from 'src/utils/common';
import { getMulterUploadInterceptor } from 'src/utils/utility.function';

@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor() {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @getMulterUploadInterceptor()
  async uploadMultipleFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() request: RequestWithUser,
  ) {
    try {
      const userId = request.user?.userId;
      const result = {};
      const baseURL = process.env.BASE_URL || 'http://localhost:9000';

      files.forEach((file) => {
        const fileUrl = `${baseURL}/uploads/users/${userId}/${file.filename}`;
        if (!result[file.fieldname]) {
          result[file.fieldname] = [];
        }
        result[file.fieldname].push(fileUrl);
      });

      return {
        message: `${files.length} files uploaded successfully`,
        files: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
