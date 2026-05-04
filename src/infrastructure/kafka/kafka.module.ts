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
import { FeedWorker } from '../../workers/feed.worker';
import { ScyllaModule } from '../scylladb/scylla.module';
import { PostgresModule } from '../postgresql/postgres.module';
import { RedisModule } from '../redis/redis.module';

@Global()
@Module({
  imports:[
    ScyllaModule,
    PostgresModule,
    RedisModule
  ],
  providers: [
    KafkaService,

    // producers
    PostProducer,
    FollowProducer,
    NotificationProducer,

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
  ],
})
export class KafkaModule {}