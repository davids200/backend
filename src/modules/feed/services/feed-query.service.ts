import {
  Injectable,
} from '@nestjs/common';

import { ScyllaService }
from '../../../infrastructure/scylladb/scylla.service';

import { FeedRankingService }
from '../../ranking/feed-ranking.service';

@Injectable()
export class FeedQueryService {

  constructor(

    private readonly scylla:
      ScyllaService,

    private readonly ranking:
      FeedRankingService,
  ) {}

  // =====================================================
  // INSERT HOME FEED
  // =====================================================

  async insertHomeFeed(
    payload:any,
  ){

    const bucketDate =

      new Date(
        payload.createdAt,
      )
      .toISOString()
      .split('T')[0];

    await this.scylla.execute(

      `
      INSERT INTO home_feed (

        user_id,

        bucket_date,

        score,

        item_type,

        created_at,

        post_id,

        author_id

      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,

      [

        payload.userId,

        bucketDate,

        payload.score,

        'POST',

        payload.createdAt,

        payload.postId,

        payload.authorId,
      ],

      {

        prepare:true,
      },
    );
  }

  // =====================================================
  // INSERT USER FEED
  // =====================================================

  async insertUserFeed(
    payload:any,
  ){

    const bucketDate =

      new Date(
        payload.createdAt,
      )
      .toISOString()
      .split('T')[0];

    await this.scylla.execute(

      `
      INSERT INTO user_feed (

        author_id,

        bucket_date,

        score,

        item_type,

        created_at,

        post_id

      ) VALUES (?, ?, ?, ?, ?, ?)
      `,

      [

        payload.authorId,

        bucketDate,

        payload.score,

        'POST',

        payload.createdAt,

        payload.postId,
      ],

      {

        prepare:true,
      },
    );
  }

  // =====================================================
  // INSERT LOCATION FEED
  // =====================================================

  async insertLocationFeed(
    payload:any,
  ){

    const bucketDate =

      new Date(
        payload.createdAt,
      )
      .toISOString()
      .split('T')[0];

    await this.scylla.execute(

      `
      INSERT INTO location_feed (

        location_id,

        bucket_date,

        score,

        item_type,

        created_at,

        post_id,

        author_id

      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,

      [

        payload.locationId,

        bucketDate,

        payload.score,

        'POST',

        payload.createdAt,

        payload.postId,

        payload.authorId,
      ],

      {

        prepare:true,
      },
    );
  }

  // =====================================================
  // INSERT HASHTAG FEED
  // =====================================================

  async insertHashtagFeed(
    payload:any,
  ){

    const bucketDate =

      new Date(
        payload.createdAt,
      )
      .toISOString()
      .split('T')[0];

    await this.scylla.execute(

      `
      INSERT INTO hashtag_feed (

        hashtag,

        bucket_date,

        score,

        item_type,

        created_at,

        post_id,

        author_id

      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,

      [

        payload.hashtag,

        bucketDate,

        payload.score,

        'POST',

        payload.createdAt,

        payload.postId,

        payload.authorId,
      ],

      {

        prepare:true,
      },
    );
  }

  // =====================================================
  // GET HOME FEED
  // =====================================================

  async getHomeFeed(
    params:{
      userId:string;
      bucketDate:string;
      limit?:number;
      cursor?:Date;
    },
  ){

    const result =
      await this.scylla.execute(

        `
        SELECT *
        FROM home_feed
        WHERE user_id = ?
        AND bucket_date = ?
        LIMIT ?
        `,

        [

          params.userId,

          params.bucketDate,

          params.limit || 50,
        ],

        {

          prepare:true,
        },
      );

    const ranked =
      await this.attachRankScores(
        result.rows,
      );

   return {

  data:

    ranked.map(

      row =>

        this.mapFeedRow(
          row,
        ),
    ),
};
  }

  // =====================================================
  // GET USER FEED
  // =====================================================

  async getUserFeed(
    params:{
      authorId:string;
      bucketDate:string;
      limit?:number;
      cursor?:Date;
    },
  ){

    const result =
      await this.scylla.execute(

        `
        SELECT *
        FROM user_feed
        WHERE author_id = ?
        AND bucket_date = ?
        LIMIT ?
        `,

        [

          params.authorId,

          params.bucketDate,

          params.limit || 50,
        ],

        {

          prepare:true,
        },
      );

    return {

      data:result.rows,
    };
  }

  // =====================================================
  // GET LOCATION FEED
  // =====================================================

  async getLocationFeed(
    params:{
      locationId:string;
      bucketDate:string;
      limit?:number;
      cursor?:Date;
    },
  ){

    const result =
      await this.scylla.execute(

        `
        SELECT *
        FROM location_feed
        WHERE location_id = ?
        AND bucket_date = ?
        LIMIT ?
        `,

        [

          params.locationId,

          params.bucketDate,

          params.limit || 50,
        ],

        {

          prepare:true,
        },
      );

    const ranked =
      await this.attachRankScores(
        result.rows,
      );

   return {

  data:

    ranked.map(

      row =>

        this.mapFeedRow(
          row,
        ),
    ),
};
  }

  // =====================================================
  // GET HASHTAG FEED
  // =====================================================

  async getHashtagFeed(
    params:{
      hashtag:string;
      bucketDate:string;
      limit?:number;
      cursor?:Date;
    },
  ){

    const result =
      await this.scylla.execute(

        `
        SELECT *
        FROM hashtag_feed
        WHERE hashtag = ?
        AND bucket_date = ?
        LIMIT ?
        `,

        [

          params.hashtag,

          params.bucketDate,

          params.limit || 50,
        ],

        {

          prepare:true,
        },
      );

    const ranked =
      await this.attachRankScores(
        result.rows,
      );

    return {

  data:

    ranked.map(

      row =>

        this.mapFeedRow(
          row,
        ),
    ),
};
  }

  // =====================================================
  // ATTACH LIVE RANK SCORES
  // =====================================================

  private async attachRankScores(
    rows:any[],
  ){

    const ranked =
      await Promise.all(

        rows.map(

          async row => {

            const score =

              await this.ranking
                .getPostRankScore(

                  row.post_id,
                );

            return {

              ...row,

              liveScore:
                score,
            };
          },
        ),
      );

    ranked.sort(

      (a,b) =>

        b.liveScore -
        a.liveScore,
    );

    return ranked;
  }




private mapFeedRow(
  row:any,
){

  return {

    postId:
      row.post_id,

    authorId:
      row.author_id,

    createdAt:
      row.created_at,

    itemType:
      row.item_type,

    score:
      row.score,

    liveScore:
      row.liveScore,
  };
}


}