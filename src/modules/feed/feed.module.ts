import { Module } from '@nestjs/common';

import { FeedService } from './feed.service';
import { FeedResolver } from './feed.resolver';

import { ScyllaService } from '../../infrastructure/scylladb/scylla.service';
import { PostModule } from '../post/post.module';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { ScyllaModule } from '../../infrastructure/scylladb/scylla.module';

@Module({
    imports:[
        PostModule,
    RedisModule,
    ScyllaModule
    ],
  providers: [FeedService, FeedResolver, ScyllaService],
  exports:[
    FeedService
  ]
})
export class FeedModule {}