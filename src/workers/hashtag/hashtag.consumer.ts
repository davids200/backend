import { Controller } from '@nestjs/common';
import {
  EventPattern,
  Payload,
} from '@nestjs/microservices';

import { HashtagService } from '../../modules/hashtag/hashtag.service';

import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';

@Controller()
export class HashtagConsumer {
  constructor(
    private readonly hashtagService: HashtagService,
  ) {}

  @EventPattern(
    KAFKA_TOPICS.HASHTAG_CREATED,
  )
  async processHashtags(
    @Payload()
    payload: {
      postId: string;
      userId: string;
      hashtags: string[];
      locationId: string;
      createdAt: Date;
    },
  ) {

    await this.hashtagService.processHashtags(
      payload,
    );
  }
}