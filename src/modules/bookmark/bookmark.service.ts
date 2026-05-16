import {
  Injectable,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';
 

import { BookmarkProducer }
from './bookmark.producer';

import { PostEntity }
from '../post/post.entity';
import { BookmarkRepository } from '../../infrastructure/scylladb/repositories/bookmark/bookmark.repository';

@Injectable()
export class BookmarkService {

  constructor(

    private readonly repo:
      BookmarkRepository,

    private readonly producer:
      BookmarkProducer,

    @InjectRepository(PostEntity)
    private readonly postRepo:
      Repository<PostEntity>,
  ) {}

  // =====================================================
  // CREATE BOOKMARK
  // =====================================================

  async bookmarkPost(

    userId:string,

    postId:string,
  ){

    // ================================================
    // VALIDATE POST
    // ================================================

    const post =
      await this.postRepo.findOne({

        where:{
          id:postId,
        },
      });

    if (!post){
      throw new Error(
        'Post not found',
      );
    }

    // ================================================
    // PREVENT DUPLICATES
    // ================================================

    const existing =
      await this.repo.findBookmark(

        userId,

        postId,
      );

    if (existing){
      throw new Error(
        'Already bookmarked',
      );
    }

    // ================================================
    // SAVE
    // ================================================

    const bookmark =
      await this.repo.createBookmark(

        userId,

        postId,
      );

    // ================================================
    // EMIT EVENT
    // ================================================

    await this.producer.bookmarkCreated({
        postId,
        userId,
        authorId:post.authorId,
        createdAt:new Date().toISOString(),
      });
    return true;
  }

  // =====================================================
  // REMOVE BOOKMARK
  // =====================================================

  async removeBookmark(

    userId:string,

    postId:string,
  ){

    await this.repo.removeBookmark(

      userId,

      postId,
    );

    await this.producer
      .bookmarkRemoved({

        postId,

        userId,

        createdAt:
          new Date()
            .toISOString(),
      });

    return true;
  }
}