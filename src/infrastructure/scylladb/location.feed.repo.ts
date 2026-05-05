import { Injectable } from '@nestjs/common';
import { ScyllaService } from './scylla.service';

@Injectable()
export class LocationFeedRepository {
  constructor(private readonly scylla: ScyllaService) {}

  async insertPost(data: {
    locationId: string;
    postId: string;
    authorId: string;
    createdAt: Date;
  }) {
    await this.scylla.execute(
      `INSERT INTO posts_by_location (location_id, created_at, post_id, author_id)
       VALUES (?, ?, ?, ?)`,
      [
        data.locationId,
        data.createdAt,
        data.postId,
        data.authorId,
      ],
    );
  }

  async insertGlobalPost(data: {
    postId: string;
    authorId: string;
    createdAt: Date;
  }) {
    await this.scylla.execute(
      `INSERT INTO posts_global (bucket, created_at, post_id, author_id)
       VALUES ('global', ?, ?, ?)`,
      [data.createdAt, data.postId, data.authorId],
    );
  }

  async getPostsByLocation(locationId: string, limit = 50) {
    const res = await this.scylla.execute(
      `SELECT post_id FROM posts_by_location
       WHERE location_id = ? LIMIT ?`,
      [locationId, limit],
    );

    return res.rows;
  }

  async getGlobalPosts(limit = 50) {
    const res = await this.scylla.execute(
      `SELECT post_id FROM posts_global
       WHERE bucket = 'global' LIMIT ?`,
      [limit],
    );

    return res.rows;
  }
}