import {
  Module,
  Global,
} from '@nestjs/common';

// =====================================================
// CORE
// =====================================================

import { KafkaService } from './kafka.service';
import { KafkaBootstrapService } from './kafka.bootstrap';

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
    KafkaBootstrapService,

    // ================================================
    // PRODUCERS
    // ================================================

    PostProducer,

    FollowProducer,

    NotificationProducer,

    LocationProducer,
  ],

  exports: [
 KafkaBootstrapService,
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