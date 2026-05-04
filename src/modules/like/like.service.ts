import { Injectable } from '@nestjs/common';
import { LikeProducer } from '../../infrastructure/kafka/producers/like.producer';
import { LikeTargetType } from './like.entity';

@Injectable()
export class LikeService {
  constructor(private readonly producer: LikeProducer) {}

  async like(
    userId: string,
    targetId: string,
    targetType: LikeTargetType,
    authorId: string,
  ) {
    await this.producer.likeCreated(
      userId,
      targetId,
      targetType,
      authorId,
    );

    return true;
  }

  async unlike(
    userId: string,
    targetId: string,
    targetType: LikeTargetType,
  ) {
    await this.producer.likeRemoved(
      userId,
      targetId,
      targetType,
    );

    return true;
  }
}