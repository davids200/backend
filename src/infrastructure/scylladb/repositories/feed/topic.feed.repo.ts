import { Injectable }
from '@nestjs/common';
import { ScyllaService } from '../../scylla.service';
 

@Injectable()
export class TopicFeedRepository {

  constructor(
    private readonly scylla:
      ScyllaService,
  ) {}

  async insertPost(data: {

    topic: string;

    postId: string;

    authorId: string;

    score: number;

    createdAt: Date;
  }) {

    await this.scylla.execute(

      `
      INSERT INTO social_app.topic_feed (

        topic,

        created_at,

        score,

        post_id,

        author_id

      )

      VALUES (?, ?, ?, ?, ?)
      `,

      [

        data.topic,

        data.createdAt,

        data.score,

        data.postId,

        data.authorId,
      ],
    );
  }
}