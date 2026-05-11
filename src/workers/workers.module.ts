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

    FeedConsumer,

    PostConsumer,
  ],

  exports: [

    FeedConsumer,

    PostConsumer,
  ],
})

export class WorkersModule {}