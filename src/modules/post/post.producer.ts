import {
  Injectable,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service'; 
 

import { PostRemovedEvent }
from '../../events/post/post-removed.event';
import { PostCreatedEvent } from '../../events/post/post-created.event';
import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';

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

      KAFKA_TOPICS.POST_DELETED,

      data,

      data.authorId,
    );
  }
}