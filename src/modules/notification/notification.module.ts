import {
  Module,
} from '@nestjs/common';

// =====================================================
// INFRASTRUCTURE
// =====================================================

import { KafkaModule }
from '../../infrastructure/kafka/kafka.module';

import { RedisModule }
from '../../infrastructure/redis/redis.module';

// =====================================================
// PRODUCERS
// =====================================================

import { NotificationProducer }
from './notification.producer';

// =====================================================
// CHANNELS
// =====================================================

// SMS
import { SmsGatewayService }
from './channels/sms/sms-gateway.service';

import { TwilioProvider }
from './channels/sms/providers/twilio.provider';

import { CustomSmsProvider }
from './channels/sms/providers/custom-sms.provider';

// EMAIL
import { EmailService }
from './channels/email/email.service';

// PUSH
import { PushService }
from './channels/push/push.service';

// =====================================================
// WORKERS
// =====================================================

import { NotificationConsumer }
from '../../workers/notification/notification.consumer';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';

@Module({

  imports: [
    TypeOrmModule.forFeature([
  NotificationEntity,
]),
    KafkaModule,
    RedisModule,
  ],

  providers: [
    NotificationProducer,
    SmsGatewayService,
    TwilioProvider,
    CustomSmsProvider,
    EmailService,
    PushService,
    NotificationConsumer,
    NotificationService
  ],

  exports: [
NotificationConsumer,
    NotificationProducer,
    NotificationService,
    SmsGatewayService,
    EmailService,
    PushService,
     
  ],
})
export class NotificationModule {}