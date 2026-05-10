import {  Injectable,} from '@nestjs/common';
import {  LikeTargetType,} from './like.entity';
import {  LikeProducer,} from './like.producer';

@Injectable()
export class LikeService {

  constructor(

    private readonly producer:
      LikeProducer,
  ) {}

  // =====================================================
  // LIKE
  // =====================================================

  async like(
    userId: string,
    targetId: string,
    targetType: LikeTargetType,
    authorId: string,
  ) {
    await this.producer.likeCreated({
      userId,
      targetId,
      targetType,
      authorId,
      createdAt:
        new Date()
          .toISOString(),
    });

    return true;
  }

  // =====================================================
  // UNLIKE
  // =====================================================

  async unlike(
    userId: string,
    targetId: string,
    targetType: LikeTargetType,
    authorId?: string,
  ) {
    await this.producer.likeRemoved({
      userId,
      targetId,
      targetType,
      authorId,
      removedAt:new Date().toISOString(),
    });
    return true;
  }
}