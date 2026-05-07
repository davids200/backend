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

@Module({

  imports: [

    KafkaModule,

    RedisModule,
  ],

  providers: [

    // ================================================
    // PRODUCER
    // ================================================

    NotificationProducer,

    // ================================================
    // SMS
    // ================================================

    SmsGatewayService,

    TwilioProvider,

    CustomSmsProvider,

    // ================================================
    // EMAIL
    // ================================================

    EmailService,

    // ================================================
    // PUSH
    // ================================================

    PushService,

    // ================================================
    // WORKERS
    // ================================================

    NotificationConsumer,
  ],

  exports: [

    NotificationProducer,

    SmsGatewayService,

    EmailService,

    PushService,
  ],
})
export class NotificationModule {}