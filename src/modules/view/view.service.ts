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

import { ViewEntity }
from './view.entity';

import { ViewProducer }
from './view.producer';

import { ViewPostInput }
from './dto/view-post.input';

import { PostEntity }
from '../post/post.entity';
import { RedisViewCounterService } from '../../infrastructure/redis/counters/view/redis.view.counter.service';



@Injectable()
export class ViewService {

  constructor(

    @InjectRepository(
      ViewEntity,
    )

    private readonly viewRepo:
      Repository<ViewEntity>,

    @InjectRepository(
      PostEntity,
    )

    private readonly postRepo:
      Repository<PostEntity>,

    private readonly producer:
      ViewProducer,

    private readonly redis:      RedisViewCounterService,
  ) {}

  // =====================================================
  // VIEW POST
  // =====================================================

  async viewPost(

    userId:string,

    input:ViewPostInput,
  ){

    // =================================================
    // CHECK POST
    // =================================================

    const post =
      await this.postRepo.findOne({

        where:{
          id:input.postId,
        },
      });

    if (!post){

      throw new BadRequestException(
        'Post not found',
      );
    }

    // =================================================
    // VIEW DEDUPE
    // =================================================

    const dedupeKey =

      `view:${userId}:${input.postId}`;

    const exists =
      await this.redis.viewExists(
        dedupeKey,
      );

    // =================================================
    // IGNORE RAPID DUPLICATES
    // =================================================

    if (exists){

      return true;
    }

    // =================================================
    // 30-SECOND WINDOW
    // =================================================

    await this.redis.setViewWindow(dedupeKey,30,
    );

    // =================================================
    // NORMALIZE VALUES
    // =================================================

    const dwellTimeMs =
      input.dwellTimeMs || 0;

    const media =
      input.media || [];

    // =================================================
    // MEANINGFUL VIEW
    // =================================================

    const meaningful =
      dwellTimeMs >= 3000;

    // =================================================
    // TOTAL WATCH TIME
    // =================================================

    const totalWatchTimeMs =
      media.reduce(

        (sum,item) =>

          sum +
          (item.watchTimeMs || 0),

        0,
      );

    // =================================================
    // COMPLETION RATE
    // =================================================

    const completionRate =
      media.length

        ? media.reduce(

            (sum,item) =>

              sum +
              (item.completionRate || 0),

            0,
          ) / media.length

        : 0;

    // =================================================
    // OPTIONAL STORAGE
    // =================================================
    // Later at hyperscale this may move
    // entirely into ScyllaDB analytics.
    // =================================================

    const view =
      this.viewRepo.create({

        userId,

        postId:
          input.postId,

        dwellTimeMs,

        totalWatchTimeMs,

        completionRate,

        meaningful,
      });

    await this.viewRepo.save(
      view,
    );

    // =================================================
    // EMIT EVENT
    // =================================================

    await this.producer
      .viewCreated({

        viewId:
          view.id,

        userId,

        postId:
          input.postId,

        dwellTimeMs,

        totalWatchTimeMs,

        completionRate,

        meaningful,

        media,

        createdAt:
          new Date()
            .toISOString(),
      });

    return true;
  }
}