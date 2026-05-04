import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationEntity } from './notification.entity';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';

import { NotificationProducer } from '../../infrastructure/kafka/producers/notification.producer';
import { NotificationConsumer } from './notification.consumer';
import { RedisPubSubService } from './pubsub/redis.pubsub.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
  providers: [
    NotificationService,
    NotificationResolver,
    NotificationProducer,
    NotificationConsumer,
    RedisPubSubService
  ],
  exports: [NotificationService],
})
export class NotificationModule {}