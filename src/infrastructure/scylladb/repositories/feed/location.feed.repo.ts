import { Injectable }
from '@nestjs/common';
import { ScyllaService } from '../../scylla.service';
 

@Injectable()
export class LocationFeedRepository {

  constructor(
    private readonly scylla:
      ScyllaService,
  ) {}

  // async insertPost(data: {
  //   locationId: string;
  //   postId: string;
  //   authorId: string;
  //   score: number;
  //   createdAt: Date;
  // }) {

  //   await this.scylla.execute(
  //           `
  //     INSERT INTO social_app.location_feed (
  //       location_id,
  //       created_at,
  //       post_id,
  //       score,
  //       author_id
  //     )

  //     VALUES (?, ?, ?,?, ?)
  //     `,
  //     [data.locationId,
  //       data.createdAt,
  //       data.postId,
  //       data.score,
  //       data.authorId,
  //     ],
  //   );
  // }

  async insertPost(params: {
  locationId: string;
  postId: string;
  itemType: string;
  authorId: string;
  score: number;
  createdAt: Date;
}) {
  const bucketDate =params.createdAt.toISOString().split('T')[0];
  await this.scylla.execute(
    `
    INSERT INTO social_app.location_feed (
      location_id,
      bucket_date,
      score,
      item_type,
      created_at,
      post_id,
      author_id
    )
    VALUES (?, ?, ?, ?, ?,?, ?)
    `,
    [
      params.locationId,
      bucketDate,
      Math.floor(params.score),
      params.itemType,
      params.createdAt,
      params.postId,
      params.authorId,
    ],
  );
}

 



//   async getFeed(params: {
//   locationId: string;
//   limit?: number;
//   cursor?: Date;
// }) {

//   const {
//     locationId,
//     limit = 20,
//     cursor,
//   } = params;

//   let query = `
//     SELECT *
//     FROM social_app.location_feed
//     WHERE location_id = ?
//   `;

//   const values: any[] = [
//     locationId,
//   ];

//   if (cursor) {
//     query += `AND created_at < ? `;
//     values.push(cursor);
//   }

//   query += `
//     LIMIT ?
//   `;

//   values.push(limit);

//   const result =
//     await this.scylla.execute(
//       query,
//       values,
//     );

//   return result.rows;
// }


async getFeed(params: {
  locationId: string;
  bucketDate?: string;
  limit?: number;
  cursor?: Date;
}) {
  const {
    locationId,
    limit = 20,
    cursor,
  } = params;

  const bucketDate =params.bucketDate || new Date().toISOString().split('T')[0];
  let query = `
    SELECT * FROM social_app.location_feed WHERE location_id = ? AND bucket_date = ? `;
  const values: any[] = [locationId, bucketDate,];
  if (cursor) {
    query += `AND created_at < ? `;
    values.push(cursor);
  }
  query += `LIMIT ?
  `;

  values.push(limit);
  const result = await this.scylla.execute( query, values,);

  return {
    posts: result.rows,
    nextCursor:result.rows.length > 0
        ? result.rows[
            result.rows.length - 1
          ].created_at

        : null,
    };
}


}