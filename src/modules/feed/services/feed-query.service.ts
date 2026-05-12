import { Injectable } from '@nestjs/common';
import { HomeFeedRepository } from '../../../infrastructure/scylladb/repositories/feed/home.feed.repo';
import { UserFeedRepository } from '../../../infrastructure/scylladb/repositories/feed/user.feed.repo';
import { LocationFeedRepository } from '../../../infrastructure/scylladb/repositories/feed/location.feed.repo';
import { HashtagFeedRepository } from '../../../infrastructure/scylladb/repositories/feed/hashtag.feed.repo';
import { PostService } from '../../post/post.service';

@Injectable()
export class FeedQueryService {
  constructor(
    private readonly homeFeedRepo: HomeFeedRepository,
    private readonly userFeedRepo: UserFeedRepository,
    private readonly locationFeedRepo: LocationFeedRepository,
    private readonly hashtagFeedRepo: HashtagFeedRepository,
    private readonly postService: PostService,
  ) {}

  // ✅ HOME FEED
  async getHomeFeed(params: { userId: string; limit?: number; cursor?: Date }) {
    const referenceDate = params.cursor || new Date();
    const bucketDate = referenceDate.toISOString().split('T')[0];

    const rows = await this.homeFeedRepo.getFeed({
      userId: params.userId,
      bucketDate,
      limit: params.limit,
      cursor: params.cursor,
    });

    return this.buildFeedResponse(rows);
  }

  // ✅ USER FEED - Added bucketDate to the parameter type definition
  async getUserFeed(params: { 
    authorId: string; 
    bucketDate?: string; // This fixes TS2353
    limit?: number; 
    cursor?: Date 
  }) {
    const bucketDate = params.bucketDate || (params.cursor || new Date()).toISOString().split('T')[0];

    const rows = await this.userFeedRepo.getPosts({
      authorId: params.authorId,
      bucketDate,
      limit: params.limit,
      cursor: params.cursor,
    });

    return this.buildFeedResponse(rows);
  }

  // ✅ LOCATION FEED
  async getLocationFeed(params: { locationId: string; limit?: number; cursor?: Date }) {
    const rows = await this.locationFeedRepo.getFeed(params);
    return this.buildFeedResponse(rows);
  }

  // ✅ HASHTAG FEED
  async getHashtagFeed(params: { hashtag: string; limit?: number; cursor?: Date }) {
    const normalized = params.hashtag.replace('#', '').trim().toLowerCase();
    const rows = await this.hashtagFeedRepo.getFeed({
      hashtag: normalized,
      limit: params.limit,
      cursor: params.cursor,
    });
    return this.buildFeedResponse(rows);
  }

  // ✅ DISCOVERY FEED - This fixes TS2339 (Property does not exist)
  async getDiscoveryFeed(params: {
    userId: string;
    locationId?: string;
    hashtags?: string[];
    limit?: number;
    cursor?: Date;
  }) {
    const { userId, locationId, hashtags = [], limit = 20, cursor } = params;
    
    // For Discovery, we fetch from HomeFeed as the base
    const homeResponse = await this.getHomeFeed({ userId, limit, cursor });
    
    // Return standard response structure
    return homeResponse;
  }

  // ✅ BUILD RESPONSE
  private async buildFeedResponse(rows: any[]) {
    if (!rows || rows.length === 0) return { posts: [], nextCursor: null };

    const postIds = rows.map((row) => row.post_id);
    const posts = await this.postService.getPostsByIds(postIds);

    const orderedPosts = postIds
      .map((id) => posts.find((p) => p.id === id))
      .filter((p) => !!p);

    return {
      posts: orderedPosts,
      nextCursor: rows[rows.length - 1].created_at,
    };
  }
}