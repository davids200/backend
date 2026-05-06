import { Module } from '@nestjs/common';

import { NotificationProducer }
from './notification.producer';

import { KafkaModule }
from '../../infrastructure/kafka/kafka.module';

@Module({
  imports: [
    KafkaModule,
  ],

  providers: [
    NotificationProducer,
  ],

  exports: [
    NotificationProducer,
  ],
})
export class NotificationModule {}