import {
  Module,
} from '@nestjs/common';

import { ScyllaService }
from './scylla.service';

import { HomeFeedRepository }
from './repositories/feed/home.feed.repo';

import { UserFeedRepository }
from './repositories/feed/user.feed.repo';

 

import { HashtagFeedRepository }
from './repositories/feed/hashtag.feed.repo';
import { LocationFeedRepository } from './repositories/feed/location.feed.repo';
import { ScyllaSchemaLoader } from './schema/schema.loader';

@Module({
  imports:[],

  providers: [

    ScyllaService,
    ScyllaSchemaLoader,

    HomeFeedRepository,

    UserFeedRepository,

    LocationFeedRepository,

    HashtagFeedRepository,
  ],

  exports: [

    ScyllaService, ScyllaSchemaLoader,

    HomeFeedRepository,

    UserFeedRepository,

    LocationFeedRepository,

    HashtagFeedRepository,
  ],
})

export class ScyllaModule {}