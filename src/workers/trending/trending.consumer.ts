import {
  Controller,
  Logger,
} from '@nestjs/common';

import {
  EventPattern,
  Payload,
  Ctx,
  KafkaContext,
} from '@nestjs/microservices';

import { RedisTrendingService }
from '../../infrastructure/redis/trending/redis.trending.service';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';

@Controller()
export class TrendingConsumer {
  private readonly logger =
    new Logger(TrendingConsumer.name);

  constructor(
    private readonly trending:
      RedisTrendingService,
  ) {}

  // =====================================================
  // LIKE CREATED
  // =====================================================

  @EventPattern(
    KAFKA_TOPICS.LIKE_CREATED,
  )
  async handleLikeCreated(
    @Payload()
    payload: {
      postId: string;
      locationId?: string;
    },

    @Ctx()
    context: KafkaContext,
  ) {

    await this.processTrendingEvent({
      postId: payload.postId,
      locationId: payload.locationId,
      score: 2,
      event: 'like.created',
    });
  }

  // =====================================================
  // COMMENT CREATED
  // =====================================================

  @EventPattern(
    KAFKA_TOPICS.COMMENT_CREATED,
  )
  async handleCommentCreated(
    @Payload()
    payload: {
      postId: string;
      locationId?: string;
    },

    @Ctx()
    context: KafkaContext,
  ) {

    await this.processTrendingEvent({
      postId: payload.postId,
      locationId: payload.locationId,
      score: 5,
      event: 'comment.created',
    });
  }

  // =====================================================
  // INTERNAL TRENDING PROCESSOR
  // =====================================================

  private async processTrendingEvent(params: {
    postId: string;
    locationId?: string;
    score: number;
    event: string;
  }) {

    const {
      postId,
      locationId,
      score,
      event,
    } = params;

    try {

      // ================================================
      // UPDATE TRENDING SCORES
      // ================================================

      await this.trending.addScore({
        postId,
        score,
        locationId,
      });

      this.logger.log(
        `🔥 Trending updated: ${postId} (${event})`,
      );

    } catch (err) {

      this.logger.error(
        `Trending processing failed (${event})`,
        err,
      );

      throw err;
    }
  }
}