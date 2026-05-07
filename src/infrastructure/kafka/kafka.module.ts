import {
  Module,
  Global,
} from '@nestjs/common';

// =====================================================
// CORE
// =====================================================

import { KafkaService }
from './kafka.service';

// =====================================================
// PRODUCERS
// =====================================================

import { PostProducer } from '../../modules/post/post.producer';
import { FollowProducer } from '../../modules/follow/follow.producer';
import { NotificationProducer } from '../../modules/notification/notification.producer';
import { LocationProducer } from '../../modules/location/location.producer';

@Global()
@Module({

  providers: [

    // ================================================
    // CORE
    // ================================================

    KafkaService,

    // ================================================
    // PRODUCERS
    // ================================================

    PostProducer,

    FollowProducer,

    NotificationProducer,

    LocationProducer,
  ],

  exports: [

    // ================================================
    // CORE
    // ================================================

    KafkaService,

    // ================================================
    // PRODUCERS
    // ================================================

    PostProducer,

    FollowProducer,

    NotificationProducer,

    LocationProducer,
  ],
})
export class KafkaModule {}