export interface FeedFanoutEvent {

  postId:string;

  authorId:string;

  visibility:string;

  createdAt:string;

  followerIds:string[];

  locationId?:string;

  hashtags?:string[];
}