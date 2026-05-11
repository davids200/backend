import {
  Injectable,
} from '@nestjs/common';

import { ScyllaService }
from '../../scylla.service';

@Injectable()
export class UserFeedRepository
{
  constructor(

    private readonly scylla:
      ScyllaService,
  ) {}

  // =====================================================
  // INSERT POST
  // =====================================================

  async insertPost(data: {

    authorId: string;

    postId: string;

    createdAt: Date;
  }) {

    const bucketDate =
      data.createdAt
        .toISOString()
        .split('T')[0];

    const query = `

      INSERT INTO social_app.user_feed (

        author_id,

        bucket_date,

        created_at,

        post_id

      )

      VALUES (?, ?, ?, ?)
    `;

    await this.scylla.execute(

      query,

      [

        data.authorId,

        bucketDate,

        data.createdAt,

        data.postId,
      ],
    );
  }

  // =====================================================
  // GET POSTS
  // =====================================================

  async getPosts(params: {

    authorId: string;

    bucketDate: string;

    limit?: number;

    cursor?: Date;
  }) {

    const {

      authorId,

      bucketDate,

      limit = 20,

      cursor,
    } = params;

    let query = `

      SELECT *

      FROM social_app.user_feed

      WHERE author_id = ?

      AND bucket_date = ?
    `;

    const values: any[] = [

      authorId,

      bucketDate,
    ];

    // ================================================
    // CURSOR PAGINATION
    // ================================================

    if (cursor) {

      query += `

        AND created_at < ?
      `;

      values.push(
        cursor,
      );
    }

    query += `

      LIMIT ?
    `;

    values.push(
      limit,
    );

    const result =
      await this.scylla.execute(

        query,

        values,
      );

    return result.rows;
  }
}