import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostResolver } from './post.resolver';

import { MinioService } from '../../infrastructure/minio/minio.service';
import { KafkaService } from '../../infrastructure/kafka/kafka.service'; 
import { PostProducer } from '../../infrastructure/kafka/producers/post.producer';
import { KafkaModule } from '../../infrastructure/kafka/kafka.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './post.entity';
import { FeedService } from '../feed/feed.service';


@Module({
  imports:[
    TypeOrmModule.forFeature([PostEntity]),
    KafkaModule,
    
  ],
  providers: [
    PostService, 
    PostResolver, 
    MinioService, 
    KafkaService,
    PostProducer,
FeedService
  ],
  exports:[
    PostService,
  KafkaModule,]
  
})
export class PostModule {}