import {
  Module,
} from '@nestjs/common';

// =====================================================
// CONSUMERS
// =====================================================

import { LikeConsumer }
from './like/like.consumer';

import { CommentConsumer }
from './comment/comment.consumer';

import { ViewConsumer }
from './view/view.consumer';

import { EngagementConsumer }
from './engagement/engagement.consumer';

import { RepostConsumer }
from './repost/repost.consumer';
 
import { RankingConsumer } from './ranking/ranking.consumer';
import { FeedModule } from '../modules/feed/feed.module';
import { BookmarkConsumer } from './bookmarks/bookmark.consumer';
import { PostConsumer } from './post/post.consumer';
import { FeedConsumer } from './feed/feed.consumer';
import { LocationModule } from '../modules/location/location.module';
import { RedisModule } from '../infrastructure/redis/redis.module';

@Module({
  imports: [
    FeedModule,
    LocationModule,
    RedisModule,
  ], 

  providers:[
    PostConsumer,
    FeedConsumer,
LikeConsumer,
CommentConsumer,
ViewConsumer,
EngagementConsumer,
FeedModule,
RepostConsumer,
RankingConsumer,
BookmarkConsumer,
  ],
})
export class WorkersModule {}