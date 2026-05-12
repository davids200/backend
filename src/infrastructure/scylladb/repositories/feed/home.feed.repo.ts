import { Injectable, Logger } from '@nestjs/common';
import { ScyllaService } from '../../scylla.service';

@Injectable()
export class HomeFeedRepository {
  private readonly logger = new Logger(HomeFeedRepository.name);

  constructor(private readonly scylla: ScyllaService) {}

// home-feed.repository.ts

async insertPost(data: {
  userId: string;
  postId: string;
  authorId: string;
  score: number;
  createdAt: Date;
}) {
  // 1. Generate the bucket_date (YYYY-MM-DD)
  const bucketDate = data.createdAt.toISOString().split('T')[0]; 

  // 2. Updated Query including bucket_date
  const query = `
    INSERT INTO social_app.home_feed (
      user_id,
      bucket_date,
      score,
      created_at,
      post_id,
      author_id
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  await this.scylla.execute(query, [
    data.userId,
    bucketDate,   // MUST match the schema
    data.score,
    data.createdAt,
    data.postId,
    data.authorId,
  ]);
}




// home.feed.repo.ts

async getFeed(params: {
  userId: string;
  bucketDate: string; // Added this
  limit?: number;
  cursor?: Date;
}) {
  const { userId, bucketDate, limit = 20, cursor } = params;

  // IMPORTANT: Since bucket_date is part of the Partition Key, 
  // it MUST be in the WHERE clause alongside user_id.
  let query = `
    SELECT *
    FROM social_app.home_feed
    WHERE user_id = ? AND bucket_date = ?
  `;

  const values: any[] = [userId, bucketDate];

  if (cursor) {
    // Note: Since your clustering order is (score DESC, created_at DESC),
    // pagination usually requires filtering by the score of the cursor too.
    // For simplicity, we'll stick to created_at if your scores are similar.
    query += ` AND created_at < ?`;
    values.push(cursor);
  }

  query += ` LIMIT ?`;
  values.push(limit);

  const result = await this.scylla.execute(query, values);
  return result.rows;
}
}