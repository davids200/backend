import {
  Injectable,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';

@Injectable()
export class BookmarkProducer {

  constructor(

    private readonly kafka:
      KafkaService,
  ) {}

  async bookmarkCreated(
    payload:any,
  ){

    await this.kafka.emit(

      KAFKA_TOPICS
        .BOOKMARK_CREATED,

      payload,
    );
  }

  async bookmarkRemoved(
    payload:any,
  ){

    await this.kafka.emit(

      KAFKA_TOPICS
        .BOOKMARK_REMOVED,

      payload,
    );
  }
}