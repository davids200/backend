// src/modules/like/like.module.ts

import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  LikeEntity,
} from './like.entity';

import {
  PostEntity,
} from '../post/post.entity';

import {
  LikeService,
} from './like.service';

import {
  LikeProducer,
} from './like.producer';

import {
  LikeResolver,
} from './like.resolver';

import {
  LikeConsumer,
} from '../../workers/like/like.consumer';

@Module({

  imports:[

    TypeOrmModule.forFeature([

      LikeEntity,

      PostEntity,
    ]),
  ],

  providers:[

    LikeService,

    LikeProducer,

    LikeResolver,

    LikeConsumer,
  ],

  exports:[

    LikeService,

    LikeConsumer,
  ],
})

export class LikeModule {
   constructor(
    private readonly likeConsumer:LikeConsumer,
  ) {}
}