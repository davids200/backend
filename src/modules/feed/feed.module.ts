import { Module } from '@nestjs/common';

import { FeedService }from './feed.service';

import { FeedConsumer }from '../../workers/feed/feed.consumer';

import { KafkaModule }from '../../infrastructure/kafka/kafka.module';

import { RedisModule }from '../../infrastructure/redis/redis.module';
import { FeedProducer } from './feed.producer';
import { ScyllaModule } from '../../infrastructure/scylladb/scylla.module';
import { LocationModule } from '../location/location.module';


@Module({
  imports: [
    RedisModule,
  KafkaModule,
  ScyllaModule,
  LocationModule,
  ],

  providers: [
    FeedService,
    FeedProducer,
    FeedConsumer
  ],
 

  exports: [
    FeedService,FeedProducer,FeedConsumer,
  ],
})
export class FeedModule {}