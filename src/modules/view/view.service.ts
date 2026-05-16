import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ViewEntity } from './view.entity';
import { ViewProducer } from './view.producer';
import { ViewPostInput } from './dto/view-post.input';
import { PostEntity } from '../post/post.entity';

@Injectable()
export class ViewService {

constructor(

@InjectRepository(ViewEntity)
private readonly viewRepo:Repository<ViewEntity>,
@InjectRepository(PostEntity)
private readonly postRepo:Repository<PostEntity>,
private readonly producer:ViewProducer,
) {}

async viewPost(userId:string,input:ViewPostInput){

const post =  await this.postRepo.findOne({ where:{id:input.postId,},});

if (!post){
throw new Error(
'Post not found',
);
}

    const meaningful =
      input.dwellTimeMs >= 3000;

    const totalWatchTimeMs =
      input.media?.reduce(

        (sum,item) =>
          sum + item.watchTimeMs,

        0,
      ) || 0;

    const completionRate =
      input.media?.length

        ? input.media.reduce(

            (sum,item) =>
              sum + item.completionRate,

            0,
          ) / input.media.length

        : 0;

    const view =
      this.viewRepo.create({

        userId,

        postId:
          input.postId,

        dwellTimeMs:
          input.dwellTimeMs,

        totalWatchTimeMs,

        completionRate,

        meaningful,
      });

    await this.viewRepo.save(
      view,
    );

    await this.producer.viewCreated({

      userId,

      postId:
        input.postId,

      dwellTimeMs:
        input.dwellTimeMs,

      meaningful,

      media:
        input.media,

      createdAt:
        new Date()
          .toISOString(),
    });

    return true;
  }
}