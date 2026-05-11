import { Injectable }
from '@nestjs/common';
import { ScyllaService } from '../../scylla.service';
 

@Injectable()
export class HomeFeedRepository {

  constructor(
    private readonly scylla:
      ScyllaService,
  ) {}

  async insertPost(data: {

    userId: string;

    postId: string;

    authorId: string;

    score: number;

    createdAt: Date;
  }) {

    await this.scylla.execute(

      `
      INSERT INTO social_app.home_feed (

        user_id,

        created_at,

        score,

        post_id,

        author_id

      )

      VALUES (?, ?, ?, ?, ?)
      `,

      [

        data.userId,

        data.createdAt,

        data.score,

        data.postId,

        data.authorId,
      ],
    );
  }


  async getFeed(params: {

  userId: string;

  limit?: number;

  cursor?: Date;
}) {

  const {
    userId,
    limit = 20,
    cursor,
  } = params;

  let query = `
    SELECT *
    FROM social_app.home_feed
    WHERE user_id = ?
  `;

  const values: any[] = [
    userId,
  ];

  // ============================================
  // CURSOR
  // ============================================

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