import { Module } from '@nestjs/common';

import { FeedService }from './feed.service';

import { FeedConsumer }from '../../workers/feed/feed.consumer';

import { KafkaModule }from '../../infrastructure/kafka/kafka.module';

import { RedisModule }from '../../infrastructure/redis/redis.module';

@Module({
  imports: [
    KafkaModule,
    RedisModule,
  ],

  providers: [
    FeedService,
  ],

  controllers: [
    FeedConsumer,
  ],

  exports: [
    FeedService,
  ],
})
export class FeedModule {}