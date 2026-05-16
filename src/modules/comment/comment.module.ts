import { Module } from '@nestjs/common';

import { TypeOrmModule }
from '@nestjs/typeorm';

import { CommentEntity }
from './entities/comment.entity';
 

import { CommentService }
from './comment.service';

import { CommentResolver }
from './comment.resolver';

import { CommentProducer }
from './comment.producer';
import { CommentRepository } from './comment.repository';
import { KafkaModule } from '../../infrastructure/kafka/kafka.module';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { PostEntity } from '../post/post.entity';

@Module({

  imports:[
TypeOrmModule.forFeature([
  CommentEntity,
  PostEntity,
]),
    KafkaModule,
    RedisModule,
  ],

  providers:[

    CommentRepository,

    CommentService,

    CommentResolver,

    CommentProducer,
  ],

  exports:[

    CommentService,
  ],
})
export class CommentModule {}