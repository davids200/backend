import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private kafka = new Kafka({
    clientId: 'social-app',
    brokers: ['localhost:9092'],
  });

  private consumer = this.kafka.consumer({
    groupId: 'feed-service',
  });

  async onModuleInit() {
    await this.consumer.connect();

    await this.consumer.subscribe({
      topic: 'post.created',
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const data = JSON.parse(message.value?.toString() || '{}');

        console.log('Kafka event received:', data);

        // 👉 CALL YOUR FEED FANOUT LOGIC HERE
      },
    });
  }
}