import { Module, Global } from '@nestjs/common';
import { KafkaService } from './kafka.service';

// producers
import { PostProducer } from './producers/post.producer';
import { FollowProducer } from './producers/follow.producer';
import { NotificationProducer } from './producers/notification.producer';

// consumers
import { FeedConsumer } from './consumers/feed.consumer';
import { NotificationConsumer } from '../../modules/notification/notification.consumer';

// workers
import { ScyllaModule } from '../scylladb/scylla.module';
import { PostgresModule } from '../postgresql/postgres.module';
import { RedisModule } from '../redis/redis.module';
import { FeedWorker } from '../../workers/feed/feed.worker';
import { LocationProducer } from './location.producer';
import { LocationFeedRepository } from '../scylladb/location.feed.repo';

@Global()
@Module({
  imports:[
    ScyllaModule,
    PostgresModule,
    RedisModule
  ],
  providers: [
    KafkaService,
LocationProducer,
    // producers
    PostProducer,
    FollowProducer,
    NotificationProducer,
LocationFeedRepository,
    // consumers
    FeedConsumer,
    // NotificationConsumer,

    // workers
    FeedWorker,
  ],
  exports: [
    KafkaService,
    PostProducer,
    FollowProducer,
    NotificationProducer,
    LocationProducer
  ],
})
export class KafkaModule {}