import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { PostgresService } from '../infrastructure/postgresql/postgres.service';
import { RedisFeedService } from '../infrastructure/redis/feed/redis.feed.service';
import { CELEBRITY_THRESHOLD } from '../modules/feed/feed.constants';


@Injectable()
export class FeedWorker implements OnModuleInit {
  private readonly logger = new Logger(FeedWorker.name);

  private kafka = new Kafka({
    clientId: 'feed-worker',
    brokers: ['localhost:9092'],
  });

  private consumer = this.kafka.consumer({
    groupId: 'feed-group',
  });

  constructor(
    private readonly postgres: PostgresService,
    private readonly redisFeed: RedisFeedService,
  ) {}

  async onModuleInit() {
    await this.start();
  }

private async start() {
await this.consumer.connect();

await this.consumer.subscribe({
topic: 'post.created',
fromBeginning: false,
});
this.logger.log('🚀 Feed Worker Started');








    //runs continuously
    //executes this block for every Kafka message
await this.consumer.run({
eachMessage: async ({ message }) => {
try {
if (!message.value) return;

const event = JSON.parse(message.value.toString());
const { postId, userId } = event;



// ============== GET FOLLOWERS=========================
const followers = await this.postgres.query(
`SELECT follower_id FROM follows WHERE following_id = $1`,
[userId],
);

//////////////////COUNT FOLLOWERS SO THAT YOU DETECT BIG ACCOUNTS//////////
const followerCount = followers?.rowCount ?? 0;
const isCelebrity = followerCount > CELEBRITY_THRESHOLD;  /// isCelebrity/big account

if (isCelebrity) {
this.logger.log(`🔥 Celebrity detected: ${userId}`);
// ❌ DO NOT fanout
return;
}
          


const followerList = followers.rows;

if (!followerList.length) return;

// =========================
// SCORE (simple for now)
// =========================
const score = Date.now();










          // =========================
          // PUSH TO REDIS FEEDS
          // =========================
          //listens for new posts
          //ignores old events
          const tasks = followerList.map((f) =>
            this.redisFeed.addToFeed(
              f.follower_id,
              postId,
              score,
            ),
          );


         // executes all writes in parallel
          await Promise.all(tasks);





          // =========================
          // TRIM FEEDS (IMPORTANT)
          // =========================
          //keeps only latest 500 posts,deletes older ones
          await Promise.all(
            followerList.map((f) =>
              this.redisFeed.trimFeed(f.follower_id),
            ),
          );

          this.logger.log(
            `Feed updated for ${followerList.length} users`,
          );
        } catch (err) {
          this.logger.error('Feed Worker Error', err);
        }
      },
    });
  }
}