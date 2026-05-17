export interface MediaViewPayload {
  mediaId:string;
  watchTimeMs:number;
  completionRate:number;
}

export interface ViewCreatedEvent {
  viewId:string;
  userId:string;
  postId:string;
  dwellTimeMs:number;
   totalWatchTimeMs:number;
   completionRate:number;
  meaningful:boolean;
  media?:MediaViewPayload[];
  createdAt:string;
}