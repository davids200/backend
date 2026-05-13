import { PostVisibility } from "../../../../modules/post/enums/post-visibility.enum";

export interface PostCreatedEvent {

  postId: string;

  authorId: string;

  content?: string;
  topics?:string[];

  mediaIds?: string[];

  hashtags?: string[];

  mentions?: string[];

  visibility:PostVisibility

  createdAt: string;

  // =====================================
  // LOCATION SUPPORT
  // =====================================

  locationId?: string;
}