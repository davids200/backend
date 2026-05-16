// src/modules/repost/repost.producer.ts

import {
  Injectable,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service'; 
import { RepostCreatedEvent } from '../../events/repost/repost-created.event';
import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';
 

@Injectable()
export class RepostProducer
{
  constructor(

    private readonly kafka:
      KafkaService,
  ) {}

  async repostCreated(
    data: RepostCreatedEvent,
  ) {

    await this.kafka.emit(
      KAFKA_TOPICS.REPOST_CREATED,
      data,
      data.userId,
    );
  }



 



}