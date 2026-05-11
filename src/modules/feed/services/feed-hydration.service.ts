import {  Injectable,} from '@nestjs/common';
import { PostService } from '../../post/post.service';

@Injectable()
export class FeedHydrationService {

  constructor(

    private readonly postService:
      PostService,
  ) {}

  async buildFeedResponse(
    rows: any[],
  ) {

    const postIds =
      rows.map(
        (row) =>
          row.post_id,
      );

    const posts =
      await this.postService
        .getPostsByIds(
          postIds,
        );

    const nextCursor =
      rows.length
        ? rows[
            rows.length - 1
          ].created_at
        : null;

    return {
      posts,
      nextCursor,
    };
  }
}