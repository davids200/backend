import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LikeEntity } from './like.entity';
import { LikeService } from './like.service'; 
import { LikeProducer } from './like.producer';
import { LikeConsumer } from '../../workers/like/like.consumer';

@Module({
  imports: [TypeOrmModule.forFeature([LikeEntity])],
  providers: [LikeService, LikeProducer, LikeConsumer],
  exports: [
    LikeService,
  LikeConsumer,
  ],
})
export class LikeModule {}