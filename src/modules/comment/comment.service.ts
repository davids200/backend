import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CommentEntity } from './entities/comment.entity';
import { CommentProducer } from '../../infrastructure/kafka/producers/comment.producer';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepo: Repository<CommentEntity>,
    private producer: CommentProducer,
  ) {}

  // =========================
  // CREATE COMMENT
  // =========================
  async createComment(userId: string, data: any) {
    const comment = this.commentRepo.create({
      ...data,
      userId,
      rootId: '', // temp
    });

    const saved = await this.commentRepo.save(comment);

    // root comment points to itself
    saved.rootId = saved.id;
    await this.commentRepo.save(saved);

    await this.producer.commentCreated({
      commentId: saved.id,
      postId: saved.postId,
      userId,
      parentId: null,
      createdAt: saved.createdAt.toISOString(),
    });

    return saved;
  }

  // =========================
  // REPLY
  // =========================
  async replyComment(userId: string, data: any) {
    const parent = await this.commentRepo.findOne({
      where: { id: data.parentId },
    });

    if (!parent) throw new Error('Parent comment not found');

    const comment = this.commentRepo.create({
      ...data,
      userId,
      rootId: parent.rootId,
    });

    const saved = await this.commentRepo.save(comment);

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
  // GET COMMENTS (TOP LEVEL)
  // =========================
  async getComments(postId: string, limit = 20) {
    return this.commentRepo.find({
      where: { postId, parentId: null },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // =========================
  // GET REPLIES
  // =========================
  async getReplies(rootId: string) {
    return this.commentRepo.find({
      where: { rootId },
      order: { createdAt: 'ASC' },
    });
  }
}