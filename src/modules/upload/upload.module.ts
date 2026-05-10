import {  Module,} from '@nestjs/common';
import { UploadController }from './upload.controller';
import { MinioModule } from '../../infrastructure/minio/minio.module';

@Module({

  imports: [
    MinioModule,
  ],

  controllers: [
    UploadController,
  ],
})
export class UploadModule {}