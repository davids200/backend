import {
  Module,
  Global,
} from '@nestjs/common';

import { KafkaService } from './kafka.service';
import { PostProducer } from '../../modules/post/post.producer';
import { FollowProducer } from '../../modules/follow/follow.producer';
import { NotificationProducer } from '../../modules/notification/notification.producer';
import { LocationProducer } from '../../modules/location/location.producer';
import { AuthConsumer } from '../../workers/auth/auth.consumer';

@Global()
@Module({
  providers: [
    KafkaService,
    PostProducer,
    FollowProducer,
    NotificationProducer,
    LocationProducer,
    AuthConsumer,
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