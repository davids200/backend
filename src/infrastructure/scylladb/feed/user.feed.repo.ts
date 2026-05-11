import { Injectable } from '@nestjs/common';
import { ScyllaService } from '../scylla.service';
 

@Injectable()
export class UserFeedRepository {

  constructor(
    private readonly scylla: ScyllaService,
  ) {}

  async insertPost(data: {
    authorId: string;
    postId: string;
    createdAt: Date;
  }) {

    await this.scylla.client.execute(

      `
      INSERT INTO user_feed (
        author_id,
        created_at,
        post_id
      )
      VALUES (?, ?, ?)
      `,

      [
        data.authorId,
        data.createdAt,
        data.postId,
      ],

      { prepare: true },
    );
  }

  async getFeed(
    authorId: string,
    limit = 20,
  ) {

    const result =
      await this.scylla.client.execute(

        `
        SELECT post_id
        FROM user_feed
        WHERE author_id = ?
        LIMIT ?
        `,

        [authorId, limit],

        { prepare: true },
      );

    return result.rows;
  }
}