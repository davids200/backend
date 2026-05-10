import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import {  FileInterceptor,} from '@nestjs/platform-express';
import {  v4 as uuid,} from 'uuid';
import { MinioService }from '../../infrastructure/minio/minio.service';

@Controller('upload')
export class UploadController {

  constructor(
    private readonly minio:
      MinioService,
  ) {}

  // =====================================================
  // UPLOAD FILE
  // =====================================================

  @Post()

  @UseInterceptors(
    FileInterceptor('file'),
  )

  async upload(

    @UploadedFile()
    file: any,
  ) {

    const mediaId =
      uuid();

    const objectName =
      `${mediaId}-${file.originalname}`;

    await this.minio.uploadBuffer({

      bucket: 'posts',

      objectName,

      buffer: file.buffer,

      mimetype: file.mimetype,
    });

    return {

      mediaId,

      objectName,
    };
  }
}