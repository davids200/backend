import {
  LikeTargetType,
} from '../../../../modules/like/like.entity';

export interface LikeRemovedEvent {

  userId: string;

  targetId: string;

  targetType: LikeTargetType;
}