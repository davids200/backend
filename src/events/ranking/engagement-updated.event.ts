export interface EngagementUpdatedEvent {

  postId:string;

  likes:number;

  comments:number;

  reposts:number;

  bookmarks?:number;

  views?:number;

  dwellTimeMs?:number;

  completionRate?:number;

  createdAt:string;

  authorId:string;
}