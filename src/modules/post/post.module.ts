import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { PostEntity } from './post.entity';

import { PostService } from './post.service';

import { PostProducer } from './post.producer';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
    ]),
  ],

  providers: [
    PostService,
    PostProducer,
  ],

  exports: [
    PostService,
    PostProducer,
  ],
})
export class PostModule {}