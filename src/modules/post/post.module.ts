import {
  Module,
  forwardRef,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import { PostEntity }
from './post.entity';

import { PostService }
from './post.service';

import { PostProducer }
from './post.producer';

import { PostResolver }
from './post.resolver';

import { PostConsumer }
from '../../workers/post/post.consumer';

import { FeedModule }
from '../feed/feed.module';

import { NotificationModule }
from '../notification/notification.module';

import { KafkaModule }
from '../../infrastructure/kafka/kafka.module';
import { LocationModule } from '../location/location.module';

@Module({

  imports: [

    TypeOrmModule.forFeature([
      PostEntity,
    ]),

    forwardRef(
      () => FeedModule,
    ),

    NotificationModule,
    KafkaModule,
    LocationModule
  ],

  providers: [
    PostService,
    PostProducer,
    PostResolver,
     PostConsumer,
  ],

  exports: [

    PostService,

     PostConsumer,
  ],
})
export class PostModule {}