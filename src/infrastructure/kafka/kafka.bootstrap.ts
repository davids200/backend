import {
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  Kafka,
  Admin,
} from 'kafkajs';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';

@Injectable()
export class KafkaBootstrapService {

  private readonly logger =
    new Logger(
      KafkaBootstrapService.name,
    );

  private kafka = new Kafka({

    clientId:
      'social-app-bootstrap',

    brokers: [
      'localhost:9092',
    ],
  });

  private admin: Admin =
    this.kafka.admin();

  // =====================================================
  // CREATE TOPICS
  // =====================================================

  async bootstrapTopics() {

    this.logger.log(
      '🚀 Bootstrapping Kafka topics...',
    );

    await this.admin.connect();

    const existingTopics =
      await this.admin.listTopics();

    // src/infrastructure/kafka/kafka-bootstrap.service.ts

 // src/infrastructure/kafka/kafka-bootstrap.service.ts

const topics = [

  // POSTS
  {
    topic:
      KAFKA_TOPICS.POST_CREATED,
    numPartitions:1,
    replicationFactor:1,
  },

  {
    topic:
      KAFKA_TOPICS.POST_DELETED,
    numPartitions:1,
    replicationFactor:1,
  },

  {
    topic:
      KAFKA_TOPICS.POST_LIKED,
    numPartitions:1,
    replicationFactor:1,
  },

  {
    topic:
      KAFKA_TOPICS.POST_COMMENTED,
    numPartitions:1,
    replicationFactor:1,
  },

  // FEEDS
  {
    topic:
      KAFKA_TOPICS.FEED_FANOUT,
    numPartitions:1,
    replicationFactor:1,
  },

  // FOLLOWS
  {
    topic:
      KAFKA_TOPICS.FOLLOW_CREATED,
    numPartitions:1,
    replicationFactor:1,
  },

  {
    topic:
      KAFKA_TOPICS.FOLLOW_REMOVED,
    numPartitions:1,
    replicationFactor:1,
  },

  // LIKES
  {
    topic:
      KAFKA_TOPICS.LIKE_CREATED,
    numPartitions:1,
    replicationFactor:1,
  },

  {
    topic:
      KAFKA_TOPICS.LIKE_REMOVED,
    numPartitions:1,
    replicationFactor:1,
  },

  // COMMENTS
  {
    topic:
      KAFKA_TOPICS.COMMENT_CREATED,
    numPartitions:1,
    replicationFactor:1,
  },

  {
    topic:
      KAFKA_TOPICS.COMMENT_REMOVED,
    numPartitions:1,
    replicationFactor:1,
  },

  // REPOSTS
  {
    topic:
      KAFKA_TOPICS.REPOST_CREATED,
    numPartitions:1,
    replicationFactor:1,
  },

  {
    topic:
      KAFKA_TOPICS.REPOST_REMOVED,
    numPartitions:1,
    replicationFactor:1,
  },

  // ENGAGEMENT
  {
    topic:
      KAFKA_TOPICS.ENGAGEMENT_UPDATED,
    numPartitions:1,
    replicationFactor:1,
  },

  // NOTIFICATIONS
  {
    topic:
      KAFKA_TOPICS.NOTIFICATION_CREATED,
    numPartitions:1,
    replicationFactor:1,
  },
];
      

    const missingTopics =
      topics.filter(

        (t) =>
          !existingTopics.includes(
            t.topic,
          ),
      );

    if (
      missingTopics.length
    ) {

      await this.admin.createTopics({

        topics:
          missingTopics.map(
            (t) => ({

              topic:
                t.topic,

              numPartitions:
                t.numPartitions,

              replicationFactor: 1,
            }),
          ),
      });

      this.logger.log(

        `✅ Created ${missingTopics.length} Kafka topics`,
      );

    } else {

      this.logger.log(
        '✅ Kafka topics already exist',
      );
    }

    await this.admin.disconnect();
  }
}