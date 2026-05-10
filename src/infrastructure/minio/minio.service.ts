import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { randomUUID } from 'crypto';

@Injectable()
export class MinioService implements OnModuleInit {
  private client!: Minio.Client;
  private bucket = 'posts';

 
async onModuleInit() {
this.client = new Minio.Client({
endPoint: 'localhost',
port: 9000,
useSSL: false,
accessKey: 'admin',
secretKey: 'password',
});

const exists = await this.client.bucketExists(this.bucket);

if (!exists) {
await this.client.makeBucket(this.bucket, 'us-east-1');
}
}



async uploadBase64(base64: string): Promise<string> {
const buffer = Buffer.from(base64, 'base64');
const filename = `${randomUUID()}.jpg`;

await this.client.putObject(this.bucket, filename, buffer);

return `http://localhost:9000/${this.bucket}/${filename}`;
}


// =====================================================
// UPLOAD BUFFER
// =====================================================

async uploadBuffer(data: {

  bucket: string;

  objectName: string;

  buffer: Buffer;

  mimetype: string;
}) {

  const exists =
    await this.client.bucketExists(
      data.bucket,
    );

  // CREATE BUCKET IF MISSING
  if (!exists) {

    await this.client.makeBucket(
      data.bucket,
      'us-east-1',
    );
  }

  // UPLOAD OBJECT
 await this.client.putObject(
  data.bucket,
  data.objectName,
  data.buffer,
  data.buffer.length,
  {
    'Content-Type':
      data.mimetype,
  },
);


  return {bucket:data.bucket,objectName:data.objectName,};
}


}