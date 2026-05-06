import {
  Module,
  Global,
} from '@nestjs/common';

import { KafkaService }
from './kafka.service';

// =====================================================
// PRODUCERS
// =====================================================

import { PostProducer }
from '../../modules/post/post.producer';

import { FollowProducer }
from '../../modules/follow/follow.producer';

import { NotificationProducer }
from '../../modules/notification/notification.producer';

import { LocationProducer }
from '../../modules/location/location.producer';

@Global()
@Module({
  providers: [

    // ================================================
    // CORE KAFKA
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
    // CORE KAFKA
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