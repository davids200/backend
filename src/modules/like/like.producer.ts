import {  Injectable,} from '@nestjs/common';
import { KafkaService }from '../../infrastructure/kafka/kafka.service';
import { KAFKA_TOPICS }from '../../common/constants/kafka-topics.constants'; 
import { LikeCreatedEvent } from '../../common/constants/contracts/events/like-created.event';
import { LikeRemovedEvent } from '../../common/constants/contracts/events/like-removed.event';

@Injectable()
export class LikeProducer {

  constructor(
    private readonly kafka:
      KafkaService,
  ) {}

  // =====================================================
  // LIKE CREATED
  // =====================================================

  async likeCreated(
    data: LikeCreatedEvent,
  ) {


    console.log(
  'EMITTING LIKE.CREATED',
);
    await this.kafka.emit(

      KAFKA_TOPICS.LIKE_CREATED,

      data,
    );
  }



  // =====================================================
  // LIKE REMOVED
  // =====================================================
  async likeRemoved(
    data: LikeRemovedEvent,
  ) {

    await this.kafka.emit(

      KAFKA_TOPICS.LIKE_REMOVED,

      data,
    );
  }
}