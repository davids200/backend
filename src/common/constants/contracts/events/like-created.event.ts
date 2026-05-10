export interface LikeCreatedEvent {

  userId: string;

  targetId: string;

  targetType:
    'post' | 'comment';

  authorId?: string;

  createdAt: string;
}