import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

// =====================================================
// ENTITIES
// =====================================================

import { BookmarkEntity }
from './entities/bookmark.entity';

import { PostEntity }
from '../post/post.entity';
 

// =====================================================
// SERVICES
// =====================================================

import { BookmarkService }
from './bookmark.service';

import { BookmarkProducer }
from './bookmark.producer';
import { BookmarkResolver } from './bookmark.resolver';
import { BookmarkRepository } from '../../infrastructure/scylladb/repositories/bookmark/bookmark.repository';
 

@Module({

imports:[

TypeOrmModule.forFeature([
BookmarkEntity,
PostEntity,
]),

],

providers:[
BookmarkRepository,
BookmarkService,
BookmarkProducer,
BookmarkResolver,
],

exports:[
BookmarkResolver,
BookmarkService,
],
})
export class BookmarkModule {}