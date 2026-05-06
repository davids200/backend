import { Injectable } from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';

@Injectable()
export class LocationProducer {
  constructor(
    private readonly kafka: KafkaService,
  ) {}

  // =====================================================
  // USER JOINED LOCATION
  // =====================================================

  async userJoinedLocation(data: {
    userId: string;
    locationId: string;
    level: number;
  }) {

    return this.kafka.emit(
      KAFKA_TOPICS.USER_LOCATION_JOINED,

      data,

      // Kafka partition key
      data.userId,
    );
  }

  // =====================================================
  // LOCATION INITIALIZED
  // =====================================================

  async locationInitialized(data: {
    userId: string;
    newLocationId: string;
  }) {

    return this.kafka.emit(
      KAFKA_TOPICS.LOCATION_INITIALIZED,

      data,

      data.userId,
    );
  }

  // =====================================================
  // LOCATION UPDATED
  // =====================================================

  async locationUpdated(data: {
    userId: string;
    oldLocationId: string;
    newLocationId: string;
  }) {

    return this.kafka.emit(
      KAFKA_TOPICS.LOCATION_UPDATED,

      data,

      data.userId,
    );
  }
}