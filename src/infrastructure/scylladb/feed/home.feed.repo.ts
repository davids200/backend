import { Injectable } from '@nestjs/common';
import { ScyllaService } from '../scylla.service';
 

@Injectable()
export class HomeFeedRepository {

  constructor(
    private readonly scylla: ScyllaService,
  ) {}

  async insertPost(data: {
    userId: string;
    postId: string;
    score: number;
    createdAt: Date;
  }) {

    await this.scylla.client.execute(

      `
      INSERT INTO home_feed (
        user_id,
        created_at,
        score,
        post_id
      )
      VALUES (?, ?, ?, ?)
      `,

      [
        data.userId,
        data.createdAt,
        data.score,
        data.postId,
      ],

      { prepare: true },
    );
  }
}