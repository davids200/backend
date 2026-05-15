import {  LikeTargetType,} from '../../../../modules/like/like.entity';

export interface LikeCreatedEvent {

  userId: string;

  targetId: string;

  targetType: LikeTargetType;

  authorId: string;

  createdAt: string;
}