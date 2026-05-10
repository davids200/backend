export interface PostCreatedEvent {

  postId: string;

  authorId: string;

  content?: string;

  mediaIds?: string[];

  hashtags?: string[];

  mentions?: string[];

  visibility:
    | 'public'
    | 'followers'
    | 'private'
    | 'local';

  createdAt: string;

  // =====================================
  // LOCATION SUPPORT
  // =====================================

  locationId?: string;
}