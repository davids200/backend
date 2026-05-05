import { Injectable } from '@nestjs/common';
import { KafkaService } from '../kafka.service';

@Injectable()
export class LocationProducer {
  constructor(private readonly kafka: KafkaService) {}

  async locationUpdated(data: {
    userId: string;
    oldLocationId: string;
    newLocationId: string;
  }) {
    await this.kafka.emit(
      'user.location.updated',
      data,
      data.userId,  
    );
  }



  
async locationInitialized(data: {
  userId: string;
  newLocationId: string;
}) {
  await this.kafka.emit(
    'user.location.initialized',
    data,
    data.userId,
  );
}


}