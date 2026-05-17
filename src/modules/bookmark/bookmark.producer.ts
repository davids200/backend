import {
  Injectable,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';
import { BookmarkCreatedEvent } from '../../events/bookmark/bookmark-created.event';

@Injectable()
export class BookmarkProducer {

  constructor(

    private readonly kafka:
      KafkaService,
  ) {}

    async bookmarkCreated(data: BookmarkCreatedEvent) {
      return this.kafka.emit(
        'bookmark.created',
        data,
        data.postId,
      );
    }
  
  async bookmarkRemoved(payload:any,){
    await this.kafka.emit(KAFKA_TOPICS.BOOKMARK_REMOVED,payload,  );
  }
}