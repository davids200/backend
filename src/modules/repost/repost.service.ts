// src/modules/repost/repost.service.ts

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

import { RepostEntity }
from './repost.entity';

import { RepostInput }
from './dto/repost.input';

import { RepostProducer }
from './repost.producer'; 

import { PostEntity }
from '../post/post.entity';

 
@Injectable()
export class RepostService
{
constructor(

@InjectRepository(RepostEntity)
private readonly repostRepo:Repository<RepostEntity>,
private readonly producer:RepostProducer,

@InjectRepository(PostEntity)
private readonly postRepo:
Repository<PostEntity>,

) {}

  async repostPost(
    userId: string,
    input: RepostInput,
  ) {

    // ============================================
    // CHECK ORIGINAL POST
    // ============================================

   const post =
  await this.postRepo
    .findOne({

      where: {
        id:
          input.postId,
      },
    });

    if (!post) {

      throw new BadRequestException(
        'Post not found',
      );
    }

    // ============================================
    // PREVENT DUPLICATE REPOST
    // ============================================

    const existing =
      await this.repostRepo.findOne({

        where: {

          userId,

          postId:
            input.postId,
        },
      });

    if (existing) {

      throw new BadRequestException(
        'Already reposted',
      );
    }

    // ============================================
    // CREATE REPOST
    // ============================================

    const repost =
      this.repostRepo.create({
        userId,
        postId:input.postId,
        quote:input.quote,
      });
await this.repostRepo.save(repost,);



// ============================================
// EMIT EVENT
// ============================================
await this.producer.repostCreated({
repostId:repost.id,
userId,
postId:repost.postId,
originalAuthorId:post.authorId,
quote:repost.quote,
createdAt:repost.createdAt.toISOString(),
});
 return repost;
  }


async findByPostId(
  postId: string,
) {

  return this.repostRepo
    .findOne({

      where: {
        postId,
      },

      order: {
        createdAt: 'DESC',
      },
    });
}


}