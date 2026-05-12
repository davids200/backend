import {
  Injectable,
} from '@nestjs/common';

import { ScyllaService }
from '../scylla.service';

@Injectable()
export class HomeFeedRepository {

  constructor(

    private readonly scylla:
      ScyllaService,
  ) {}

  // =====================================================
  // INSERT HOME FEED POST
  // =====================================================

  async insertPost(data: {

    userId: string;

    postId: string;

    authorId: string;

    score: number;

    createdAt: Date;
  }) {

    // ================================================
    // BUCKET DATE
    // ================================================

    const bucketDate =
      data.createdAt
        .toISOString()
        .split('T')[0];

    // ================================================
    // INSERT
    // ================================================

    await this.scylla.execute(

      `
      INSERT INTO social_app.home_feed (

        user_id,

        bucket_date,

        score,

        created_at,

        post_id,

        author_id

      )

      VALUES (?, ?, ?, ?, ?, ?)
      `,

      [

        String(data.userId),

        bucketDate,

        Math.floor(data.score),

        data.createdAt,

        String(data.postId),

        String(data.authorId),
      ],
    );
  }

  // =====================================================
  // GET HOME FEED
  // =====================================================

  async getFeed(params: {

    userId: string;

    bucketDate?: string;

    limit?: number;

    cursor?: Date;
  }) {

    const {

      userId,

      limit = 20,

      cursor,
    } = params;

    // ================================================
    // DEFAULT TODAY BUCKET
    // ================================================

    const bucketDate =
      params.bucketDate ||

      new Date()
        .toISOString()
        .split('T')[0];

    // ================================================
    // QUERY
    // ================================================

    let query = `
      SELECT *

      FROM social_app.home_feed

      WHERE user_id = ?

      AND bucket_date = ?
    `;

    const values: any[] = [

      String(userId),

      bucketDate,
    ];

    // ================================================
    // CURSOR PAGINATION
    // ================================================

    if (cursor) {

      query += `
        AND created_at < ?
      `;

      values.push(cursor);
    }

    // ================================================
    // LIMIT
    // ================================================

    query += `
      LIMIT ?
    `;

    values.push(limit);

    const result =
      await this.scylla.execute(

        query,

        values,
      );

    // ================================================
    // RESPONSE
    // ================================================

    return {

      posts: result.rows,

      nextCursor:

        result.rows.length > 0

          ? result.rows[
              result.rows.length - 1
            ].created_at

          : null,
    };
  }
}