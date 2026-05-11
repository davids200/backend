import { Injectable }
from '@nestjs/common';
import { ScyllaService } from '../../scylla.service';
 

@Injectable()
export class HashtagFeedRepository {

  constructor(
    private readonly scylla:
      ScyllaService,
  ) {}

  async insertPost(data: {

    hashtag: string;

    postId: string;

    authorId: string;

    score: number;

    createdAt: Date;
  }) {

    await this.scylla.execute(

      `
      INSERT INTO social.hashtag_feed (

        hashtag,

        created_at,

        score,

        post_id,

        author_id

      )

      VALUES (?, ?, ?, ?, ?)
      `,

      [

        data.hashtag,

        data.createdAt,

        data.score,

        data.postId,

        data.authorId,
      ],
    );
  }

 
  async getFeed(params: {

  hashtag: string;

  limit?: number;

  cursor?: Date;
}) {

  const {
    hashtag,
    limit = 20,
    cursor,
  } = params;

  let query = `
    SELECT *
    FROM social.hashtag_feed
    WHERE hashtag = ?
  `;

  const values: any[] = [
    hashtag,
  ];

  if (cursor) {

    query += `
      AND created_at < ?
    `;

    values.push(cursor);
  }

  query += `
    LIMIT ?
  `;

  values.push(limit);

  const result =
    await this.scylla.execute(
      query,
      values,
    );

  return result.rows;
}


}