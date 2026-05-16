export interface MediaViewPayload {
  mediaId:string;
  watchTimeMs:number;
  completionRate:number;
}

export interface ViewCreatedEvent {
  userId:string;
  postId:string;
  dwellTimeMs:number;
  meaningful:boolean;
  media?:MediaViewPayload[];
  createdAt:string;
}