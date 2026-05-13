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
 

import { RepostResolver }
from './repost.resolver';

import { RepostProducer }
from './repost.producer';
import { RepostService } from './repost.service';
import { PostEntity } from '../post/post.entity';
 

@Module({
  imports: [
    TypeOrmModule.forFeature([RepostEntity,PostEntity,])
    
  ],

  providers: [

    RepostService,

    RepostResolver,

    RepostProducer,
  ],

  exports: [

    RepostService,
  ],
})
export class RepostModule {}