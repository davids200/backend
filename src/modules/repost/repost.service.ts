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


import { RepostInput }
from './dto/repost.input';

import { RepostProducer }
from './repost.producer';
import { RepostEntity } from './repost.entity';
import { PostEntity } from '../post/post.entity';

@Injectable()
export class RepostService {

  constructor(

    @InjectRepository(
      RepostEntity,
    )

    private readonly repostRepo:
      Repository<RepostEntity>,

    @InjectRepository(
      PostEntity,
    )

    private readonly postRepo:
      Repository<PostEntity>,

    private readonly producer:
      RepostProducer,
  ) {}

  // =====================================================
  // CREATE REPOST
  // =====================================================

  async repostPost(userId:string,input:RepostInput,){

    
    // CHECK POST
    // =================================================
    const post = await this.postRepo.findOne({
        where:{ id:input.postId,  },
      });

    if (!post){
      throw new BadRequestException(
        'Post not found',
      );
    }

    
    // PREVENT DUPLICATES
    // =================================================
    const existing =      await this.repostRepo.findOne({

        where:{
          userId,
          postId:input.postId,
        },
      });

    if (existing){
      throw new BadRequestException(
        'Already reposted',
      );
    }

    // =================================================
    // CREATE
    // =================================================

    const repost =   this.repostRepo.create({
        userId,
        postId:input.postId,
        quote:input.quote,
      });

    await this.repostRepo.save(repost,  );

    // =================================================
    // EMIT EVENT
    // =================================================

    await this.producer.repostCreated({
        repostId:repost.id,
        userId,
        postId:repost.postId,
        originalAuthorId:post.authorId,
        quote:repost.quote,
        createdAt: repost.createdAt.toISOString(),
      });
    return repost;
  }

  // =====================================================
  // REMOVE REPOST
  // =====================================================

  async removeRepost(userId:string,postId:string,){

    // =================================================
    // FIND REPOST
    // =================================================

    const repost =
      await this.repostRepo.findOne({
        where:{
          userId,
          postId,
        },
      });

    if (!repost){

      throw new BadRequestException(
        'Repost not found',
      );
    }

    // =================================================
    // REMOVE
    // =================================================

    await this.repostRepo.remove(repost,    );

    // =================================================
    // EMIT EVENT
    // =================================================

    await this.producer.repostRemoved({
        repostId:repost.id,
        userId,
        postId,
        createdAt:new Date().toISOString(),
      });
    return true;
  }

  // =====================================================
  // FIND BY POST
  // =====================================================

  async findByPostId(
    postId:string,
  ){
    return this.repostRepo.find({
      where:{
        postId,
      },
      order:{
        createdAt:'DESC',
      },
    });
  }
}