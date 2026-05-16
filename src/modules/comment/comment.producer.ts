import { Injectable } from '@nestjs/common';
import { KafkaService } from '../../infrastructure/kafka/kafka.service'; 
import { CommentCreatedEvent } from '../../events/comment/comment-created.event';
import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';
@Injectable()
export class CommentProducer {
  constructor(private kafka: KafkaService) {}

  async commentCreated(data: CommentCreatedEvent) {
    return this.kafka.emit(
      'comment.created',
      data,
      data.postId,
    );
  }

async commentRemoved(payload:any,){
  await this.kafka.emit(KAFKA_TOPICS.COMMENT_REMOVED,payload,  );
}


}