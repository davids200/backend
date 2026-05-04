import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommentEntity } from './entities/comment.entity';
import { CommentService } from './comment.service';

import { RedisModule } from '../../infrastructure/redis/redis.module';
import { KafkaModule } from '../../infrastructure/kafka/kafka.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity]),  
    RedisModule,
    KafkaModule,
  ],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}