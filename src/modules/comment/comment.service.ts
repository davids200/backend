import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CommentEntity } from './entities/comment.entity';
import { CommentProducer } from '../../infrastructure/kafka/producers/comment.producer';

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
    @InjectRepository(CommentEntity)
    private readonly commentRepo: Repository<CommentEntity>,
    private readonly producer: CommentProducer,
  ) {}

  // =========================
  // CREATE COMMENT (ROOT)
  // =========================
  async createComment(userId: string, data: CreateCommentInput) {
    // 1. create entity
    const comment = this.commentRepo.create({
      postId: data.postId,
      content: data.content,
      userId,
      parentId: null,
    });

    // 2. save once
    const saved = await this.commentRepo.save(comment);

    // 3. set rootId = self (no second save needed)
    await this.commentRepo.update(saved.id, {
      rootId: saved.id,
    });

    // 4. emit event (async system)
    await this.producer.commentCreated({
      commentId: saved.id,
      postId: saved.postId,
      userId,
      parentId: null,
      createdAt: saved.createdAt.toISOString(),
    });

    return {
      ...saved,
      rootId: saved.id,
    };
  }

  // =========================
  // REPLY TO COMMENT
  // =========================
  async replyComment(userId: string, data: ReplyCommentInput) {
    // 1. find parent (only needed fields)
    const parent = await this.commentRepo.findOne({
      where: { id: data.parentId },
      select: ['id', 'rootId', 'postId'],
    });

    if (!parent) {
      throw new Error('Parent comment not found');
    }

    // 2. create reply
    const comment = this.commentRepo.create({
      postId: data.postId,
      content: data.content,
      userId,
      parentId: parent.id,
      rootId: parent.rootId, // critical for thread grouping
    });

    const saved = await this.commentRepo.save(comment);

    // 3. emit event
    await this.producer.commentCreated({
      commentId: saved.id,
      postId: saved.postId,
      userId,
      parentId: parent.id,
      createdAt: saved.createdAt.toISOString(),
    });

    return saved;
  }

  // =========================
  // GET TOP-LEVEL COMMENTS
  // =========================
  async getComments(postId: string, limit = 20, cursor?: Date) {
    const query = this.commentRepo
      .createQueryBuilder('c')
      .where('c.postId = :postId', { postId })
      .andWhere('c.parentId IS NULL');

    if (cursor) {
      query.andWhere('c.createdAt < :cursor', { cursor });
    }

    return query
      .orderBy('c.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  // =========================
  // GET REPLIES (THREAD)
  // =========================
  async getReplies(rootId: string, limit = 50, offset = 0) {
    return this.commentRepo.find({
      where: { rootId },
      order: { createdAt: 'ASC' },
      skip: offset,
      take: limit,
    });
  }
}