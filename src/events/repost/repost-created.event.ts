// src/common/constants/contracts/events/repost-created.event.ts

export interface RepostCreatedEvent {

  repostId:string;

  userId:string;

  postId:string;

  originalAuthorId:string;

  quote?:string;

  createdAt:string;
}