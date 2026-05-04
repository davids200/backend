import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer, Producer } from 'kafkajs';
import { LikeTargetType } from '../../modules/like/like.entity';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly kafka = new Kafka({
    clientId: 'social-app',
    brokers: ['localhost:9092'],
  });

  private producer!: Producer;
  private consumer!: Consumer;

  async onModuleInit() {
    this.producer = this.kafka.producer();
    await this.producer.connect();
  }

  // ✅ PRODUCER
   async emit(topic: string, value: unknown, key?: string): Promise<void> {
    await this.producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(value),
        },
      ],
    });
  }


  // ✅ CONSUMER WRAPPER
  async consume(
    groupId: string,
    topic: string,
    handler: (message: any) => Promise<void>,
  ) {
    const consumer = this.kafka.consumer({ groupId });

    await consumer.connect();
    await consumer.subscribe({
      topic,
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ message }) => {
        await handler(message);
      },
    });

    this.consumer = consumer;
  }

  async onModuleDestroy() {
    await this.producer?.disconnect();
    await this.consumer?.disconnect();
  }
}