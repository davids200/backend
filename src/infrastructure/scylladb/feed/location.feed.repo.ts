import {
  Injectable,
} from '@nestjs/common';
import { ScyllaService } from '../scylla.service';
 

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

    const query = `

      INSERT INTO social.location_feed (

        location_id,

        created_at,

        post_id,

        author_id
      )

      VALUES (?, ?, ?, ?)
    `;

    await this.scylla.execute(

      query,

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

      FROM social.location_feed

      WHERE location_id = ?
    `;

    const values: any[] = [
      locationId,
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