import { Injectable } from "@nestjs/common";
import { KafkaService } from "./kafka.service";

@Injectable()
export class LocationProducer {
  constructor(private readonly kafka: KafkaService) {}

  async userJoinedLocation(data: {
    userId: string;
    locationId: string;
    level: number;
  }) {
    await this.kafka.emit(
      'user.location.joined',
      data,
      data.userId,
    );
  }
}