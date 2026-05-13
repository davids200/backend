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
  itemType: string;
  score: number;
  createdAt: Date;
}) {
  
  const bucketDate =  data.createdAt    .toISOString()    .split('T')[0];    await this.scylla.execute(

  `
  INSERT INTO social_app.hashtag_feed (
    hashtag,
    bucket_date,
    score,
    created_at,
    post_id,
    author_id,
    item_type
  )
  VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
  [
    data.hashtag,
    bucketDate,
    data.score,
    data.createdAt,
    data.postId,
    data.authorId,
    data.itemType,
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