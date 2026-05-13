import {
  Injectable,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';

import { PostCreatedEvent }
from '../../common/constants/contracts/events/post-created.event';

import { PostRemovedEvent }
from '../../common/constants/contracts/events/post-removed.event';

@Injectable()
export class PostProducer {

  constructor(

    private readonly kafka:
      KafkaService,
  ) {}

  // =====================================================
  // POST CREATED
  // =====================================================

  async postCreated(data: PostCreatedEvent,  ) {

    // TEMP TEST LOCATION
    const payload = {...data,locationId:data.locationId,    };
 
    await this.kafka.emit(
      KAFKA_TOPICS.POST_CREATED,
      payload,
      payload.authorId,
    );
  }

  // =====================================================
  // POST REMOVED
  // =====================================================

  async postRemoved(
    data: PostRemovedEvent,
  ) {

    console.log(
      '📤 post.removed.event',
      data,
    );

    await this.kafka.emit(

      KAFKA_TOPICS.POST_REMOVED,

      data,

      data.authorId,
    );
  }
}