import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CommentRepository }
from './comment.repository';

import { CommentProducer }
from './comment.producer';

interface CreateCommentInput {

  postId: string;

  content: string;
}

interface ReplyCommentInput {

  postId: string;

  content: string;

  parentId: string;
}

@Injectable()
export class CommentService {

  constructor(

    private readonly repository:
      CommentRepository,

    private readonly producer:
      CommentProducer,
  ) {}

  // =====================================================
  // CREATE ROOT COMMENT
  // =====================================================

  async createComment(

    userId: string,

    data: CreateCommentInput,
  ) {

    // ================================================
    // CREATE ENTITY
    // ================================================

    const comment =
      this.repository.create({

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
      await this.repository.save(
        comment,
      );

    // ================================================
    // ROOT ID = SELF
    // ================================================

    await this.repository.update(

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
      await this.repository
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
      this.repository.create({

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
      await this.repository.save(
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
    return this.repository.getRootComments(params,);
  }



  // GET THREAD REPLIES
  async getReplies(params: {
    rootId: string;
    limit?: number;
    offset?: number;
  }) {
    return this.repository
      .getReplies(
        params,
      );
  }
}