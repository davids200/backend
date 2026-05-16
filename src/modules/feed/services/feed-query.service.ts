// src/modules/feed/services/feed-query/feed-query.service.ts

import { Injectable } from '@nestjs/common';

import { InjectRepository }
from '@nestjs/typeorm';

import { Repository }
from 'typeorm';

import { HomeFeedRepository }
from '../../../infrastructure/scylladb/repositories/feed/home.feed.repo';

import { UserFeedRepository }
from '../../../infrastructure/scylladb/repositories/feed/user.feed.repo';

import { LocationFeedRepository }
from '../../../infrastructure/scylladb/repositories/feed/location.feed.repo';

import { HashtagFeedRepository }
from '../../../infrastructure/scylladb/repositories/feed/hashtag.feed.repo';

import { PostService }
from '../../post/post.service';

import { RepostEntity }
from '../../repost/repost.entity';

import { FeedItemType }
from '../types/feed-item.type';

import { VisibilityService }
from './visibility/visibility.service';

import { FeedRankingService }
from '../../ranking/feed-ranking.service';

@Injectable()
export class FeedQueryService {

  constructor(

    @InjectRepository(RepostEntity)
    private readonly repostRepo:
      Repository<RepostEntity>,

    private readonly homeFeedRepo:
      HomeFeedRepository,

    private readonly userFeedRepo:
      UserFeedRepository,

    private readonly locationFeedRepo:
      LocationFeedRepository,

    private readonly hashtagFeedRepo:
      HashtagFeedRepository,

    private readonly postService:
      PostService,

    private readonly visibilityService:
      VisibilityService,

    private readonly rankingService:
      FeedRankingService,
  ) {}

  // =====================================================
  // HOME FEED
  // =====================================================

  async getHomeFeed(params:{
    userId:string;
    viewerId?:string;
    viewerLocationId?:string;
    limit?:number;
    cursor?:Date;
  }) {

    const referenceDate =
      params.cursor || new Date();

    const bucketDate =
      referenceDate
        .toISOString()
        .split('T')[0];

    const rows =
      await this.homeFeedRepo.getFeed({

        userId:
          params.userId,

        bucketDate,

        limit:
          params.limit,

        cursor:
          params.cursor,
      });

    const rankedPosts =
      await this.attachRankScores(
        rows,
      );

    return this.buildFeedResponse(

      rankedPosts,

      params.viewerId,

      params.viewerLocationId,
    );
  }

  // =====================================================
  // USER FEED
  // =====================================================

  async getUserFeed(params:{
    authorId:string;
    viewerId?:string;
    viewerLocationId?:string;
    bucketDate?:string;
    limit?:number;
    cursor?:Date;
  }) {

    const bucketDate =
      params.bucketDate ||

      (params.cursor || new Date())
        .toISOString()
        .split('T')[0];

    const rows =
      await this.userFeedRepo.getPosts({

        authorId:
          params.authorId,

        bucketDate,

        limit:
          params.limit,

        cursor:
          params.cursor,
      });

    const rankedPosts =
      await this.attachRankScores(
        rows,
      );

    return this.buildFeedResponse(

      rankedPosts,

      params.viewerId,

      params.viewerLocationId,
    );
  }

  // =====================================================
  // LOCATION FEED
  // =====================================================

  async getLocationFeed(params:{
    locationId:string;
    viewerId?:string;
    viewerLocationId?:string;
    bucketDate?:string;
    limit?:number;
    cursor?:Date;
  }) {

    const rows =
      await this.locationFeedRepo.getFeed(
        params,
      );

    const rankedPosts =
      await this.attachRankScores(
        rows.posts,
      );

    return this.buildFeedResponse(

      rankedPosts,

      params.viewerId,

      params.viewerLocationId,
    );
  }

  // =====================================================
  // HASHTAG FEED
  // =====================================================

  async getHashtagFeed(params:{
    hashtag:string;
    viewerId?:string;
    viewerLocationId?:string;
    limit?:number;
    cursor?:Date;
  }) {

    const normalized =
      params.hashtag
        .replace('#','')
        .trim()
        .toLowerCase();

    const rows =
      await this.hashtagFeedRepo.getFeed({

        hashtag:
          normalized,

        limit:
          params.limit,

        cursor:
          params.cursor,
      });

    const rankedPosts =
      await this.attachRankScores(
        rows,
      );

    return this.buildFeedResponse(

      rankedPosts,

      params.viewerId,

      params.viewerLocationId,
    );
  }

  // =====================================================
  // DISCOVERY FEED
  // =====================================================

  async getDiscoveryFeed(params:{
    userId:string;
    viewerId?:string;
    viewerLocationId?:string;
    locationId?:string;
    hashtags?:string[];
    limit?:number;
    cursor?:Date;
  }) {

    const {
      userId,
      viewerId,
      viewerLocationId,
      limit = 20,
      cursor,
    } = params;

    return this.getHomeFeed({

      userId,

      viewerId,

      viewerLocationId,

      limit,

      cursor,
    });
  }

  // =====================================================
  // ATTACH REDIS RANK SCORES
  // =====================================================

  private async attachRankScores(
    rows:any[],
  ) {

    const rankedPosts =
      await Promise.all(

        rows.map(async row => {

          const score =
            await this.rankingService
              .getPostRankScore(

                row.post_id,
              );

          return {

            ...row,

            rankScore:score,
          };
        }),
      );

    // ================================================
    // SORT BY SCORE
    // ================================================

    rankedPosts.sort(

      (a,b) =>
        b.rankScore - a.rankScore,
    );

    return rankedPosts;
  }

  // =====================================================
  // BUILD FEED RESPONSE
  // =====================================================

  private async buildFeedResponse(
    rows:any[],
    viewerId?:string,
    viewerLocationId?:string,
  ) {

    if (!rows || rows.length === 0) {

      return {

        items:[],

        nextCursor:null,
      };
    }

    const results:any[] = [];

    for (const row of rows) {

      // ===============================================
      // NORMAL POSTS
      // ===============================================

      if (
        row.item_type ===
        FeedItemType.POST
      ) {

        const post =
          await this.postService
            .getPostById(
              row.post_id,
            );

        if (!post) {
          continue;
        }

        const canView =
          await this.visibilityService
            .canViewPost({

              viewerId,

              authorId:
                post.authorId,

              visibility:
                post.visibility,

              viewerLocationId,

              postLocationId:
                post.locationId,
            });

        if (!canView) {
          continue;
        }

        results.push({

          type:
            FeedItemType.POST,

          score:
            row.rankScore || row.score,

          createdAt:
            row.created_at,

          data:post,
        });
      }

      // ===============================================
      // REPOSTS
      // ===============================================

      if (

        row.item_type ===
        FeedItemType.REPOST ||

        row.item_type ===
        FeedItemType.QUOTE_REPOST
      ) {

        const repost =
          await this.repostRepo.findOne({

            where:{
              postId:
                row.post_id,
            },

            order:{
              createdAt:'DESC',
            },
          });

        if (!repost) {
          continue;
        }

        results.push({

          type:
            row.item_type,

          score:
            row.rankScore || row.score,

          createdAt:
            row.created_at,

          data:repost,
        });
      }
    }

    return {

      items:results,

      nextCursor:
        rows[rows.length - 1]
          ?.created_at || null,
    };
  }
}