import { Module } from '@nestjs/common';

import { TypeOrmModule }
from '@nestjs/typeorm';

import { ViewEntity }
from './view.entity';

import { ViewService }
from './view.service';

import { ViewResolver }
from './view.resolver';

import { ViewProducer }
from './view.producer';

import { ViewConsumer }
from '../../workers/view/view.consumer';
import { PostEntity } from '../post/post.entity';

@Module({

  imports:[

   TypeOrmModule.forFeature([
  ViewEntity,
  PostEntity,
]),
  ],

  providers:[
    ViewService,
    ViewResolver,
    ViewProducer,
    ViewConsumer,
  ],

  exports:[
    ViewService,
    ViewResolver,
  ],
})
export class ViewModule {}