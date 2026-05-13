import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  In,
  Repository,
} from 'typeorm';

import * as crypto
from 'crypto';

import { PostEntity }
from './post.entity';

import { CreatePostInput }
from './dto/create-post.input';

import { PostProducer }
from './post.producer';

import { LocationService }
from '../location/location.service';

import { RedisService }
from '../../infrastructure/redis/redis.service';

import { detectTopics }
from '../feed/constants/utils/topic-detector.util';

import { PostVisibility }
from './enums/post-visibility.enum';

@Injectable()
export class PostService {

  constructor(

    @InjectRepository(PostEntity)
    private readonly repo:
      Repository<PostEntity>,

    private readonly producer:
      PostProducer,

    private readonly locationService:
      LocationService,

    private readonly redis:
      RedisService,
  ) {}

  // =====================================================
  // CREATE POST
  // =====================================================

  async createPost(
    userId: string,
    input: CreatePostInput,
  ) {

    // ================================================
    // RATE LIMIT
    // ================================================

    const rateKey =
      `post-rate:${userId}`;

    const postCount =
      await this.redis.client.incr(
        rateKey,
      );

    if (postCount === 1) {

      await this.redis.client.expire(
        rateKey,
        60,
      );
    }

    if (postCount > 5) {

      throw new BadRequestException(
        'Posting too fast',
      );
    }

    // ================================================
    // DUPLICATE CONTENT CHECK
    // ================================================

    const safeContent =

  input.content?.trim() || '';

const contentHash =
  crypto
    .createHash('sha256')
    .update(
      safeContent,
    )
    .digest('hex');

    const spamKey =
      `post-hash:${userId}:${contentHash}`;

    const exists =
      await this.redis.client.get(
        spamKey,
      );

    if (exists) {

      throw new BadRequestException(
        'Duplicate post detected',
      );
    }

   await this.redis.client.set(spamKey,'1','EX',60,);

    // ================================================
    // EXTRACT MENTIONS
    // ================================================

    const mentions =
  safeContent.match(
        /@\w+/g,
      ) || [];

    // ================================================
    // EXTRACT HASHTAGS
    // ================================================

    const hashtags =
  safeContent.match(
        /#\w+/g,
      ) || [];

      console.log("hashtags in post service",hashtags)
    // ================================================
    // DETECT TOPICS
    // ================================================

    const topics =
      detectTopics(
  safeContent,
);

    // ================================================
    // VALIDATE LOCATION
    // ================================================

    let validatedLocationId:
      string | undefined;

    if (
      input.visibility !==
      PostVisibility.PUBLIC
    ) {

      if (!input.locationId) {

        throw new BadRequestException(
          'locationId required',
        );
      }

      const location =
        await this.locationService
          .findOne(
            input.locationId,
          );

      if (!location) {

        throw new BadRequestException(
          'Invalid locationId',
        );
      }

      validatedLocationId =
        location.id;
    }

    // ================================================
    // CREATE ENTITY
    // ================================================

    const post =
      this.repo.create({

        authorId: userId,

        content: input.content,

        visibility:

          input.visibility ||

          PostVisibility.PUBLIC,

        locationId:
          validatedLocationId,
      });

    // ================================================
    // SAVE TO POSTGRESQL
    // ================================================

    const saved =
      await this.repo.save(
        post,
      );

    // ================================================
    // EMIT EVENT
    // ================================================

    await this.producer.postCreated({

      postId:
        saved.id,

      authorId:
        saved.authorId,

      content:
        saved.content,

      visibility:
        saved.visibility,

      topics,

      mentions,

      hashtags,

      mediaIds: [],

      createdAt:
        saved.createdAt
          .toISOString(),

      locationId:
        saved.locationId,
    });

    return saved;
  }

  // =====================================================
  // GET POST
  // =====================================================

  async getPostById(
    id: string,
  ) {

    const post =
      await this.repo.findOne({

        where: {
          id,
        },
      });

    if (!post) {

      throw new NotFoundException(
        'Post not found',
      );
    }

    return post;
  }

  // =====================================================
  // GET POSTS BY IDS
  // =====================================================

  async getPostsByIds(
    ids: string[],
  ) {

    if (!ids.length) {

      return [];
    }

    return this.repo.find({

      where: {
        id: In(ids),
      },
    });
  }

  // =====================================================
  // DELETE POST
  // =====================================================

  async deletePost(

    id: string,

    userId: string,
  ) {

    const post =
      await this.repo.findOne({

        where: {
          id,
        },
      });

    if (!post) {

      throw new NotFoundException(
        'Post not found',
      );
    }

    if (
      post.authorId !== userId
    ) {

      throw new BadRequestException(
        'Unauthorized',
      );
    }

    await this.repo.delete(
      id,
    );

    await this.producer.postRemoved({

      postId:
        post.id,

      authorId:
        post.authorId,

      removedAt:
        new Date()
          .toISOString(),
    });

    return true;
  }
}