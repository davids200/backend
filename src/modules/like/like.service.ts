// src/modules/like/like.service.ts

import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  LikeEntity,
  LikeTargetType,
} from './like.entity';

import {
  LikeProducer,
} from './like.producer';

import {
  PostEntity,
} from '../post/post.entity';

@Injectable()
export class LikeService {

  constructor(

    @InjectRepository(LikeEntity)
    private readonly likeRepo:
      Repository<LikeEntity>,

    @InjectRepository(PostEntity)
    private readonly postRepo:
      Repository<PostEntity>,

    private readonly producer:
      LikeProducer,
  ) {}

  // =====================================================
  // LIKE POST
  // =====================================================

  async likePost(
    userId:string,
    postId:string,
  ) {

    const post =
      await this.postRepo.findOne({

        where:{
          id:postId,
        },
      });

    if (!post) {

      throw new BadRequestException(
        'Post not found',
      );
    }

    return this.like(

      userId,

      postId,

      LikeTargetType.POST,

      post.authorId,
    );
  }

  // =====================================================
  // UNLIKE POST
  // =====================================================

  async unlikePost(
    userId:string,
    postId:string,
  ) {

    return this.unlike(

      userId,

      postId,

      LikeTargetType.POST,
    );
  }

  // =====================================================
  // CORE LIKE LOGIC
  // =====================================================

  private async like(
    userId:string,
    targetId:string,
    targetType:LikeTargetType,
    authorId:string,
  ) {

    // ================================================
    // PREVENT DUPLICATE LIKE
    // ================================================

    const existing =
      await this.likeRepo.findOne({

        where:{

          userId,

          targetId,

          targetType,
        },
      });

    if (existing) {
     throw new BadRequestException(
    'Already liked',
  );
    }

    // ================================================
    // CREATE LIKE
    // ================================================

    const like =
      this.likeRepo.create({

        userId,

        targetId,

        targetType,
      });

    await this.likeRepo.save(
      like,
    );

    // ================================================
    // EMIT EVENT
    // ================================================

    await this.producer.likeCreated({
      userId,
      targetId,
      targetType,
      authorId,
      createdAt:new Date().toISOString(),
    });
    return true;
  }

  // =====================================================
  // CORE UNLIKE LOGIC
  // =====================================================

  private async unlike(
    userId:string,
    targetId:string,
    targetType:LikeTargetType,
  ) {

    await this.likeRepo.delete({

      userId,

      targetId,

      targetType,
    });


    await this.producer.likeRemoved({

  userId,

  targetId,

  targetType,
});

    return true;
  }
}