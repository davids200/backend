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

  }

  
  // FANOUT POST  
async fanoutPost(data: FeedFanoutEvent,) { 
   console.log('📰 FEED PRODUCER CALLED', data, );
await this.kafka.emit(

  KAFKA_TOPICS.FEED_FANOUT,  {
    postId:data.postId,
    authorId:data.authorId,
    visibility:data.visibility,
    locationId:data.locationId,
    hashtags:data.hashtags,
    createdAt:data.createdAt,
  },
);
}


// INVALIDATE FEED
async invalidateFeed(data: FeedInvalidateEvent,) {
await this.kafka.emit(KAFKA_TOPICS.FEED_INVALIDATE,data,data.userId,);
}







}