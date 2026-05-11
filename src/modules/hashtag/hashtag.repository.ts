import {
  Injectable,
} from '@nestjs/common';
import { ScyllaService } from '../../infrastructure/scylladb/scylla.service';


@Injectable()
export class HashtagRepository {

  constructor(

    private readonly scylla:
      ScyllaService,
  ) {}

  // =====================================================
  // INSERT POST ↔ HASHTAG RELATION
  // =====================================================

  async insertHashtagByPost(params: {

    postId: string;

    hashtag: string;
  }) {

    await this.scylla.execute(

      `
      INSERT INTO social.hashtags_by_post (

        post_id,

        hashtag

      )

      VALUES (?, ?)
      `,

      [

        params.postId,

        params.hashtag,
      ],
    );
  }

  // =====================================================
  // INSERT POST INTO HASHTAG FEED
  // =====================================================

  async insertPostByHashtag(params: {

    hashtag: string;

    score: number;

    createdAt: Date;

    postId: string;

    authorId: string;
  }) {

    await this.scylla.execute(

      `
      INSERT INTO social.posts_by_hashtag (

        hashtag,

        score,

        created_at,

        post_id,

        author_id

      )

      VALUES (?, ?, ?, ?, ?)
      `,

      [

        params.hashtag,

        params.score,

        params.createdAt,

        params.postId,

        params.authorId,
      ],
    );
  }

  // =====================================================
  // GET POSTS BY HASHTAG
  // =====================================================

  async getPostsByHashtag(params: {

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

      FROM social.posts_by_hashtag

      WHERE hashtag = ?
    `;

    const values: any[] = [
      hashtag,
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

  // =====================================================
  // GET HASHTAGS BY POST
  // =====================================================

  async getHashtagsByPost(
    postId: string,
  ) {

    const result =
      await this.scylla.execute(

        `
        SELECT hashtag

        FROM social.hashtags_by_post

        WHERE post_id = ?
        `,

        [
          postId,
        ],
      );

    return result.rows;
  }
}