import {  Injectable,} from '@nestjs/common';
import { KafkaService }from '../../infrastructure/kafka/kafka.service';
import { KAFKA_TOPICS }from '../../common/constants/kafka-topics.constants'; 
import { FeedFanoutEvent } from '../../common/constants/contracts/events/feed-fanout.event';
import { FeedInvalidateEvent } from '../../common/constants/contracts/events/feed-invalidate.event';

@Injectable()
export class FeedProducer {

  constructor(
    private readonly kafka:
      KafkaService,
  ) {

    console.log('📰 FEED PRODUCER CONSTRUCTOR' );
  }

  
  // FANOUT POST  
async fanoutPost(data: FeedFanoutEvent,) {
   console.log('📰 FEED PRODUCER CALLED', data, );
await this.kafka.emit(KAFKA_TOPICS.FEED_FANOUT,data,data.authorId,);
}


// INVALIDATE FEED
async invalidateFeed(data: FeedInvalidateEvent,) {
await this.kafka.emit(KAFKA_TOPICS.FEED_INVALIDATE,data,data.userId,);
}







}