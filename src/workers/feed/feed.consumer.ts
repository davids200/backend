import { Controller } from '@nestjs/common';

import {
  EventPattern,
  Payload,
} from '@nestjs/microservices';

import { FeedService }
from '../../modules/feed/feed.service';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';

@Controller()
export class FeedConsumer {
  constructor(
    private readonly feedService:
      FeedService,
  ) {}

  @EventPattern(
    KAFKA_TOPICS.POST_CREATED,
  )
  async handlePostCreated(
    @Payload()
    payload: {
      postId: string;
      userId: string;
      locationId?: string;

      // Kafka delivers string
      createdAt: string;
    },
  ) {

    await this.feedService.processPost({

      ...payload,

      // ============================================
      // SAFE DATE NORMALIZATION
      // ============================================

      createdAt:
        new Date(payload.createdAt),
    });
  }
}