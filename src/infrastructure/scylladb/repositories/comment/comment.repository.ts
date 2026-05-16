import {
  Injectable,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';
import { CommentEntity } from '../../../../modules/comment/entities/comment.entity';
 

@Injectable()
export class CommentRepository {

  constructor(

    @InjectRepository(
      CommentEntity,
    )

    private readonly repo:
      Repository<CommentEntity>,
  ) {}

  // =====================================================
  // CREATE ENTITY
  // =====================================================

  create(data: Partial<CommentEntity>) {

    return this.repo.create(
      data,
    );
  }

  // =====================================================
  // SAVE COMMENT
  // =====================================================

  async save(
    comment: CommentEntity,
  ) {

    return this.repo.save(
      comment,
    );
  }

  // =====================================================
  // UPDATE COMMENT
  // =====================================================

  async update(
    id: string,
    data: Partial<CommentEntity>,
  ) {

    return this.repo.update(
      id,
      data,
    );
  }

  // =====================================================
  // FIND COMMENT BY ID
  // =====================================================
async findById(
  id:string,
){

  return this.repo.findOne({

    where:{ id },
  });
}

async remove(
  comment:CommentEntity,
){

  return this.repo.remove(
    comment,
  );
}

  // =====================================================
  // FIND PARENT COMMENT
  // =====================================================

  async findParentComment(
    id: string,
  ) {

    return this.repo.findOne({

      where: {
        id,
      },

      select: [

        'id',

        'rootId',

        'postId',
      ],
    });
  }

  // =====================================================
  // GET ROOT COMMENTS
  // =====================================================

  async getRootComments(params: {

    postId: string;

    limit?: number;

    cursor?: Date;
  }) {

    const {

      postId,

      limit = 20,

      cursor,
    } = params;

    const query =
      this.repo
        .createQueryBuilder(
          'c',
        )

        .where(
          'c.postId = :postId',
          { postId },
        )

        .andWhere(
          'c.parentId IS NULL',
        );

    // ================================================
    // CURSOR PAGINATION
    // ================================================

    if (cursor) {

      query.andWhere(

        'c.createdAt < :cursor',

        { cursor },
      );
    }

    return query

      .orderBy(
        'c.createdAt',
        'DESC',
      )

      .limit(limit)

      .getMany();
  }

  // =====================================================
  // GET THREAD REPLIES
  // =====================================================

  async getReplies(params: {

    rootId: string;

    limit?: number;

    offset?: number;
  }) {

    const {

      rootId,

      limit = 50,

      offset = 0,
    } = params;

    return this.repo.find({

      where: {
        rootId,
      },

      order: {
        createdAt: 'ASC',
      },

      skip: offset,

      take: limit,
    });
  }
}