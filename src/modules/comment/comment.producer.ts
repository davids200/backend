import { Injectable } from '@nestjs/common';
import { KafkaService } from '../../infrastructure/kafka/kafka.service'; 
import { CommentCreatedEvent } from '../../common/constants/contracts/events/comment-created.event';
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


//IS COMMENT REMOVED NECESSARY?
// async commentRemoved(
//   data: CommentRemovedEvent,
// )


}