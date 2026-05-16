export interface CommentRemovedEvent {

  commentId: string;

  postId: string;

  userId: string;

  parentId?: string | null;

  removedAt: string;
}