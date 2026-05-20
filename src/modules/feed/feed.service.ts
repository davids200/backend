import {
  Injectable,
} from '@nestjs/common';

import { FeedQueryService }
from './services/feed-query.service';

import { DiscoveryFeedService }
from './services/discovery-feed.service';

import { FeedRankingService }
from '../ranking/feed-ranking.service';

@Injectable()
export class FeedService {

  constructor(

    private readonly feedQuery:
      FeedQueryService,

    private readonly discoveryFeed:
      DiscoveryFeedService,

    private readonly ranking:
      FeedRankingService,
  ) {}

  // =====================================================
  // FANOUT POST
  // =====================================================

  async fanoutPost(
    payload:any,
  ){

    const {

      postId,

      authorId,

      followerIds = [],

      createdAt,

      locationId,

      hashtags = [],
    } = payload;

    // =================================================
    // HOME FEED SCORE
    // =================================================

    const homeFeedScore =
      this.ranking.calculateScore({
        likes:0,
        comments:0,
        reposts:0,
        bookmarks:0,
        views:0,
        dwellTimeMs:0,
        completionRate:0,
        createdAt:new Date(),
        isFollowingAuthor:true,
        isLocalAuthor:false,
      });

    // =================================================
    // USER FEED SCORE
    // =================================================
    // Profile feeds are mostly chronological
    // =================================================

    const userFeedScore =      Date.now();

    // =================================================
    // LOCATION FEED SCORE
    // =================================================

    const locationFeedScore =

      this.ranking.calculateScore({

        likes:0,

        comments:0,

        reposts:0,

        bookmarks:0,

        views:0,

        dwellTimeMs:0,

        completionRate:0,

        createdAt:new Date(),

        isFollowingAuthor:false,

        isLocalAuthor:true,
      });






      





    // =================================================
    // HOME FEED
    // =================================================

    if (followerIds.length){

      await Promise.all(

        followerIds.map(

          async (
            followerId:string,
          ) => {

            await this.feedQuery
              .insertHomeFeed({

                userId:
                  followerId,

                postId,

                authorId,

                createdAt,

                score:homeFeedScore,
              });
          },
        ),
      );
    }







    // =================================================
    // USER FEED
    // =================================================

    await this.feedQuery
      .insertUserFeed({

        userId:
          authorId,

        postId,

        authorId,

        createdAt,

        score:userFeedScore,
      });

    // =================================================
    // LOCATION FEED
    // =================================================

    if (locationId){

      await this.feedQuery
        .insertLocationFeed({

          locationId,

          postId,

          authorId,

          createdAt,

          score:
            locationFeedScore,
        });
    }




    
    // =================================================
    // HASHTAG FEED SCORE
    // =================================================

    const hashtagFeedScore =

      this.ranking.calculateScore({

        likes:0,

        comments:0,

        reposts:0,

        bookmarks:0,

        views:0,

        dwellTimeMs:0,

        completionRate:0,

        createdAt:new Date(),

        isFollowingAuthor:false,

        isLocalAuthor:false,
      });

console.log(
  'GENERATED HASHTAG SCORE',
  hashtagFeedScore,
);

    if (hashtags.length){

      await Promise.all(

        hashtags.map(

          async (
            hashtag:string,
          ) => {

            await this.feedQuery
              .insertHashtagFeed({

                hashtag,

                postId,

                authorId,

                createdAt,

                score:
                  hashtagFeedScore,
              });
          },
        ),
      );
    }
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

    return this.feedQuery
      .getHomeFeed(
        params,
      );
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

    return this.feedQuery
      .getUserFeed(
        params,
      );
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

    return this.feedQuery
      .getLocationFeed(
        params,
      );
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

    return this.feedQuery
      .getHashtagFeed(
        params,
      );
  }

  // =====================================================
  // DISCOVERY FEED
  // =====================================================

  async getDiscoveryFeed(
    params:any,
  ){

    return this.discoveryFeed
      .getDiscoveryFeed(
        params,
      );
  }
}