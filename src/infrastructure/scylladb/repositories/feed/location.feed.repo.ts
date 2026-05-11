import { Injectable }
from '@nestjs/common';
import { ScyllaService } from '../../scylla.service';
 

@Injectable()
export class LocationFeedRepository {

  constructor(
    private readonly scylla:
      ScyllaService,
  ) {}

  async insertPost(data: {

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

        data.locationId,

        data.createdAt,

        data.postId,

        data.authorId,
      ],
    );
  }

 
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