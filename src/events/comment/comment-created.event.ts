export interface CommentCreatedEvent {

  commentId: string;

  postId: string;

  userId: string;

  content?: string;

  parentId?: string | null;

  rootId?: string | null;

  createdAt: string;
}