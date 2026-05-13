import {  Module,  forwardRef,} from '@nestjs/common';
import { FeedService }from './feed.service';
import { FeedResolver }from './feed.resolver';
import { PostModule }from '../post/post.module';


// repositories
import { HomeFeedRepository }
from '../../infrastructure/scylladb/repositories/feed/home.feed.repo';

import { UserFeedRepository }
from '../../infrastructure/scylladb/repositories/feed/user.feed.repo';

import { LocationFeedRepository }
from '../../infrastructure/scylladb/repositories/feed/location.feed.repo';

import { HashtagFeedRepository }
from '../../infrastructure/scylladb/repositories/feed/hashtag.feed.repo';

// services
import { FeedQueryService }
from './services/feed-query.service';

import { FeedHydrationService }
from './services/feed-hydration.service';

import { DiscoveryFeedService }
from './services/discovery-feed.service';
import { ScyllaModule } from '../../infrastructure/scylladb/scylla.module';
import { FeedProducer } from './feed.producer';
import { RepostModule } from '../repost/repost.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepostEntity } from '../repost/repost.entity';
import { VisibilityService } from './services/visibility/visibility.service';

@Module({

  imports: [
TypeOrmModule.forFeature([
  RepostEntity,
]),
    forwardRef(
      () => PostModule,
    ),
RepostModule,
    ScyllaModule,
  ],

  providers: [

    // ============================================
    // MAIN
    // ============================================

    FeedService,

    FeedResolver,

    // ============================================
    // INTERNAL SERVICES
    // ============================================

    FeedQueryService,
VisibilityService,
    FeedHydrationService,

    DiscoveryFeedService,

    // ============================================
    // PRODUCERS
    // ============================================

    FeedProducer,

    // ============================================
    // REPOSITORIES
    // ============================================

    HomeFeedRepository,

    UserFeedRepository,

    LocationFeedRepository,

    HashtagFeedRepository,
  ],

  exports: [

    FeedService,
LocationFeedRepository,
    // IMPORTANT
    FeedProducer,
  ],
})
export class FeedModule {}