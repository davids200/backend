// src/modules/repost/repost.module.ts

import {
  Module,
  forwardRef,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import { RepostEntity }
from './repost.entity';

import { RepostService }
from './repost.service';

import { RepostResolver }
from './repost.resolver';

import { RepostProducer }
from './repost.producer';

import { PostModule }
from '../post/post.module';

@Module({

  imports: [

    TypeOrmModule.forFeature([
      RepostEntity,
    ]),

    forwardRef(() =>
      PostModule,
    ),
  ],

  providers: [
    RepostService,
    RepostResolver,
    RepostProducer,
  ],

  exports: [
    RepostService,
    RepostProducer, 
  ],
})
export class RepostModule {}