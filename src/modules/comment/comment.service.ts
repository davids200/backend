import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CommentRepository }
from './comment.repository';

import { CommentProducer }
from './comment.producer';
import { CreateCommentInput } from './dto/create-comment.input';
import { ReplyCommentInput } from './dto/reply-comment.input';
import { InjectRepository }
from '@nestjs/typeorm';

import { Repository }
from 'typeorm';

import { PostEntity }
from '../post/post.entity';
 
@Injectable()
export class CommentService {

  constructor(
private readonly commentRepo:
    CommentRepository,

  @InjectRepository(PostEntity)
  private readonly postRepo:
    Repository<PostEntity>,

  private readonly producer:
    CommentProducer,
  ) {}

  // =====================================================
  // CREATE ROOT COMMENT
  // =====================================================

  async createComment(userId: string,data: CreateCommentInput,  ) {
    const post =  await this.postRepo.findOne({
      where: { id: data.postId }
    });

if (!post){
  throw new Error(
    'Post not found',
  );
}

    // ================================================
    // CREATE ENTITY
    // ================================================

    const comment =
      this.commentRepo.create({

        postId:
          data.postId,

        content:
          data.content,

        userId,

        parentId: null,
      });

    // ================================================
    // SAVE
    // ================================================

    const saved =
      await this.commentRepo.save(
        comment,
      );

    // ================================================
    // ROOT ID = SELF
    // ================================================

    await this.commentRepo.update(

      saved.id,

      {
        rootId: saved.id,
      },
    );

    // ================================================
    // EVENT
    // ================================================

    await this.producer
      .commentCreated({

        commentId:
          saved.id,

        postId:
          saved.postId,

        userId,

        parentId: null,

        createdAt:
          saved.createdAt
            .toISOString(),
      });

    return {

      ...saved,

      rootId:
        saved.id,
    };
  }

  // =====================================================
  // REPLY COMMENT
  // =====================================================

  async replyComment(

    userId: string,

    data: ReplyCommentInput,
  ) {

    // ================================================
    // FIND PARENT
    // ================================================

    const parent =
      await this.commentRepo
        .findParentComment(
          data.parentId,
        );

    if (!parent) {

      throw new NotFoundException(

        'Parent comment not found',
      );
    }

    // ================================================
    // CREATE REPLY
    // ================================================

    const comment =
      this.commentRepo.create({

        postId:
          data.postId,

        content:
          data.content,

        userId,

        parentId:
          parent.id,

        rootId:
          parent.rootId,
      });

    const saved =
      await this.commentRepo.save(
        comment,
      );

    // ================================================
    // EVENT
    // ================================================

    await this.producer
      .commentCreated({

        commentId:
          saved.id,

        postId:
          saved.postId,

        userId,

        parentId:
          parent.id,

        createdAt:
          saved.createdAt
            .toISOString(),
      });

    return saved;
  }

  // =====================================================
  // GET ROOT COMMENTS
  // =====================================================

  async getComments(params: {postId: string;limit?: number;cursor?: Date;}) {
    return this.commentRepo.getRootComments(params,);
  }



  // GET THREAD REPLIES
  async getReplies(params: {
    rootId: string;
    limit?: number;
    offset?: number;
  }) {
    return this.commentRepo
      .getReplies(
        params,
      );
  }
}