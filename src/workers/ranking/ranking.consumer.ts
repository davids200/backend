import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

import { RedisService }
from '../../infrastructure/redis/redis.service';

 
import { EngagementUpdatedEvent }
from '../../common/constants/contracts/events/engagement-updated.event';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';
import { FeedRankingService } from '../../modules/ranking/feed-ranking.service';

@Injectable()
export class RankingConsumer
implements OnModuleInit {

  private readonly logger =
    new Logger(
      RankingConsumer.name,
    );

  constructor(
    private readonly kafka:KafkaService,
    private readonly redis:RedisService,
    private readonly rankingService:FeedRankingService,
  ) {
     console.log('RANKING CONSUMER IN CONSTRUCTOR')
  }

  async onModuleInit() {
    await this.start();
  }

  async start() {
   // console.log('RANKING EVENT RECEIVED',event,);

    await this.kafka.consume<EngagementUpdatedEvent>(
      'ranking-group',
      KAFKA_TOPICS.ENGAGEMENT_UPDATED,

      async (event) => {
        await this.handleRanking(
          event,
        );
      },
    );
    this.logger.log('✅ RankingConsumer running',    );
  }





  // =====================================================
  // HANDLE RANKING
  // =====================================================
  private async handleRanking(
    event: EngagementUpdatedEvent,
  ) {

const score =this.rankingService.calculateScore({
likes:event.likes,
comments:event.comments,
reposts:event.reposts,
createdAt:new Date(event.createdAt,),
});



// ================================================
// STORE HOT SCORE
// ================================================
// await this.redis.client.zadd(
// 'post_rankings',
// score,
// event.postId,
// );
if (score <= 0) {

  await this.redis.client.zrem(
  'post_rankings',
  event.postId,
);

} else {

  await this.redis.client.zadd(
  'post_rankings',
  score,
  event.postId,
);
}

this.logger.log(`📈 Score updated: post=${event.postId} score=${score}`,
);
}
}