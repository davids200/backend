import { Injectable, OnModuleInit } from "@nestjs/common";
import { Kafka } from "kafkajs";
import { LocationRedisService } from "../../redis/location/redis.location.service";

@Injectable()
export class LocationConsumer implements OnModuleInit {
  private readonly kafka = new Kafka({
    clientId: 'location-service',
    brokers: ['localhost:9092'],
  });

  private consumer = this.kafka.consumer({
    groupId: 'location-group',
  });

  constructor(
    private readonly redisLocation: LocationRedisService,
  ) {}

  async onModuleInit() {
    await this.consumer.connect();

    await this.consumer.subscribe({
      topic: 'user.location.updated',
    });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        const event = JSON.parse(message.value.toString());

        const { userId, oldLocationId, newLocationId } = event;

        // REMOVE FROM OLD
        if (oldLocationId) {
          await this.redisLocation.removeUserFromLocation(
            oldLocationId,
            userId,
          );
        }

        // ADD TO NEW
        await this.redisLocation.addUserToLocation(
          newLocationId,
          userId,
        );
      },
    });
  }
}