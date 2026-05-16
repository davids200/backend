export interface FeedFanoutEvent {

  postId: string;

  authorId: string;

  visibility: string;

  createdAt: string;

  locationId?: string;
  hashtags?: string[];
}