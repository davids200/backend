import { Injectable } from '@nestjs/common';

import { KafkaService } from '../../infrastructure/kafka/kafka.service'; 
import { ViewCreatedEvent } from '../../events/view/view-created.event';
import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';
 
@Injectable()
export class ViewProducer {

  constructor(
    private readonly kafka:KafkaService,
  ) {}

  async viewCreated(event:ViewCreatedEvent){

    await this.kafka.emit(
      KAFKA_TOPICS.VIEW_CREATED,
      event,
    );
  }
}