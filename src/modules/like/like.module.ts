import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LikeEntity } from './like.entity';
import { LikeService } from './like.service';

import { LikeProducer } from '../../infrastructure/kafka/producers/like.producer';
import { LikeConsumer } from '../../infrastructure/kafka/consumers/like.consumer';

@Module({
  imports: [TypeOrmModule.forFeature([LikeEntity])],
  providers: [LikeService, LikeProducer, LikeConsumer],
  exports: [LikeService],
})
export class LikeModule {}