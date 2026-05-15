import {
  Module,
} from '@nestjs/common';

import { KafkaModule }
from '../infrastructure/kafka/kafka.module';

import { RedisModule }
from '../infrastructure/redis/redis.module';

import { ScyllaModule }
from '../infrastructure/scylladb/scylla.module';

import { FeedModule }
from '../modules/feed/feed.module';

import { PostModule }
from '../modules/post/post.module';

import { NotificationModule }
from '../modules/notification/notification.module';

import { LocationModule }
from '../modules/location/location.module';

import { FeedConsumer }
from './feed/feed.consumer';

import { PostConsumer }
from './post/post.consumer';
import { FollowConsumer } from './follow/follow.consumer';
import { LikeConsumer } from './like/like.consumer';
import { RankingConsumer } from './ranking/ranking.consumer';

@Module({

  imports: [

    KafkaModule,

    RedisModule,

    ScyllaModule,

    FeedModule,

    PostModule,

    NotificationModule,

    LocationModule,
  ],

  providers: [
PostConsumer,

  FeedConsumer,

  FollowConsumer, 

  RankingConsumer,
  ],

  exports: [

    FeedConsumer,

    PostConsumer,
  ],
})

export class WorkersModule {
  constructor(

  private readonly postConsumer:PostConsumer,

  private readonly followConsumer:FollowConsumer, 

  private readonly rankingConsumer:RankingConsumer,
) {}
}