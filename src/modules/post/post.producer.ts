import { Injectable } from '@nestjs/common';
import { KafkaService } from '../../infrastructure/kafka/kafka.service';
import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';

@Injectable()
export class PostProducer {
  constructor(
    private readonly kafka: KafkaService,
  ) {}
 

// POST CREATED EVENT 
async postCreated(data: {
postId: string;
userId: string;
locationId?: string;
createdAt: Date;
}) {
return this.kafka.emit(
KAFKA_TOPICS.POST_CREATED,
data,
// Kafka partition key
data.postId,
);
}


// HASHTAG CREATED EVENT 
async hashtagCreated(data: {
postId: string;
userId: string;
hashtags: string[];
locationId?: string;
createdAt: Date;
}) {
return this.kafka.emit(
KAFKA_TOPICS.HASHTAG_CREATED,
data,
// Kafka partition key
data.postId,
);
}






}