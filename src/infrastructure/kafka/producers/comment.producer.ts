import { Injectable } from '@nestjs/common';
import { KafkaService } from '../kafka.service';

@Injectable()
export class CommentProducer {
  constructor(private kafka: KafkaService) {}

  async commentCreated(data: {
    commentId: string;
    postId: string;
    userId: string;
    parentId: string | null;
    createdAt: string;
  }) {
    return this.kafka.emit(
      'comment.created',
      data,
      data.postId,
    );
  }
}