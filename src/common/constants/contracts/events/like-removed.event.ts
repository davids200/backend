export interface LikeRemovedEvent {

  userId: string;

  targetId: string;

  targetType:
    'post' | 'comment';

  authorId?: string;

  removedAt: string;
}