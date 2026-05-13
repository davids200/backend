import { Module } from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';
 

import { FollowService }
from './follow.service';

import { FollowResolver }
from './follow.resolver';

import { FollowProducer }
from './follow.producer';

import { FollowConsumer }
from '../../workers/follow/follow.consumer';

import { KafkaModule }
from '../../infrastructure/kafka/kafka.module';

import { RedisModule }
from '../../infrastructure/redis/redis.module';
import { FollowEntity } from './entities/follow.entity';
import { UserEntity } from '../user/entities/user.entity';

@Module({

  imports: [

    TypeOrmModule.forFeature([
      FollowEntity,UserEntity,
    ]),

    KafkaModule,

    RedisModule,
  ],

  providers: [

    FollowService,

    FollowResolver,

    FollowProducer,

    FollowConsumer,
  ],

  exports: [

    FollowService,
    FollowConsumer,
  ],
})
export class FollowModule {}