//ONLY handles ScyllaDB queries.
//No business logic here.

import { Injectable } from '@nestjs/common'; 
import { ScyllaService } from '../../infrastructure/scylladb/scylla.service';

@Injectable()
export class HashtagRepository {
  constructor(
    private readonly scyllaDBService: ScyllaService,
  ) {}

  // Save hashtag relation
  async insertHashtagByPost(params: {
    postId: string;
    hashtag: string;
  }) {
    const query = `
      INSERT INTO social.hashtags_by_post (
        post_id,
        hashtag
      )
      VALUES (?, ?)
    `;

    await this.scyllaDBService.execute(
      query,
      [
        params.postId,
        params.hashtag,
      ],
      { prepare: true },
    );
  }

  // Save post inside hashtag feed
  async insertPostByHashtag(params: {
    hashtag: string;
    score: number;
    createdAt: Date;
    postId: string;
    authorId: string;
  }) {

    const query = `
      INSERT INTO social.posts_by_hashtag (
        hashtag,
        score,
        created_at,
        post_id,
        author_id
      )
      VALUES (?, ?, ?, ?, ?)
    `;

    await this.scyllaDBService.execute(
      query,
      [
        params.hashtag,
        params.score,
        params.createdAt,
        params.postId,
        params.authorId,
      ],
      { prepare: true },
    );
  }
}