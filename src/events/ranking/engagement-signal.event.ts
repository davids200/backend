export interface EngagementSignalEvent {

  postId:string;

  actorId:string;

  type:
    | 'LIKE'
    | 'COMMENT'
    | 'VIEW'
    | 'BOOKMARK'
    | 'REPOST';

  createdAt:string;
}