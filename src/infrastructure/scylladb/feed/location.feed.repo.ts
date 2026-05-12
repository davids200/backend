import {
  Injectable,
} from '@nestjs/common';

import { ScyllaService }
from '../scylla.service';

@Injectable()
export class LocationFeedRepository {

  constructor(

    private readonly scylla:
      ScyllaService,
  ) {}

  // =====================================================
  // INSERT LOCATION FEED
  // =====================================================

  async insertPost(params: {

    locationId: string;

    postId: string;

    authorId: string;

    createdAt: Date;
  }) {

    await this.scylla.execute(

      `
      INSERT INTO social_app.location_feed (

        location_id,

        created_at,

        post_id,

        author_id

      )

      VALUES (?, ?, ?, ?)
      `,

      [

        params.locationId,

        params.createdAt,

        params.postId,

        params.authorId,
      ],
    );
  }

  // =====================================================
  // GET LOCATION FEED
  // =====================================================

  async getFeed(params: {

    locationId: string;

    limit?: number;

    cursor?: Date;
  }) {

    const {

      locationId,

      limit = 20,

      cursor,
    } = params;

    let query = `
      SELECT *

      FROM social_app.location_feed

      WHERE location_id = ?
    `;

    const values: any[] = [
      locationId,
    ];

    // ================================================
    // PAGINATION
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

    return {

      posts: result.rows,

      nextCursor:

        result.rows.length
          ? result.rows[
              result.rows.length - 1
            ].created_at
          : null,
    };
  }
}