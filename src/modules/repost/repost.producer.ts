import {
  Injectable,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';

@Injectable()
export class RepostProducer {

  constructor(

    private readonly kafka:
      KafkaService,
  ) {}

  async repostCreated(
    payload:any,
  ){

    await this.kafka.emit(

      KAFKA_TOPICS
        .REPOST_CREATED,

      payload,
    );
  }
 

async repostRemoved(
  payload:any,
){

  await this.kafka.emit(

    KAFKA_TOPICS
      .REPOST_REMOVED,

    payload,
  );
}


}