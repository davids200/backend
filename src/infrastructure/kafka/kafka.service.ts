import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import {
  Kafka,
  Consumer,
  Producer,
  Partitioners,
} from 'kafkajs';

@Injectable()
export class KafkaService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger =
    new Logger(
      KafkaService.name,
    );

  // =====================================================
  // KAFKA INSTANCE
  // =====================================================

  private readonly kafka =
    new Kafka({

      clientId:
        'social-app',

      brokers: [
        'localhost:9092',
      ],
    });

  // =====================================================
  // PRODUCER
  // =====================================================

  private producer!: Producer;

  // =====================================================
  // ACTIVE CONSUMERS
  // =====================================================

  private readonly consumers:
    Consumer[] = [];

  // =====================================================
  // MODULE INIT
  // =====================================================

  async onModuleInit() {

    try {

      this.producer =
        this.kafka.producer({

          createPartitioner:
            Partitioners.LegacyPartitioner,
        });

      await this.producer.connect();

      this.logger.log(
        '✅ Kafka producer connected',
      );

    } catch (err) {

      this.logger.error(
        '❌ Kafka producer connection failed',
        err,
      );

      throw err;
    }
  }

  // =====================================================
  // EMIT EVENT
  // =====================================================

 async emit(

  topic: string,

  value: unknown,

  key?: string,
): Promise<void> {

  this.logger.log(
    `📤 Emitting → ${topic}`,
  );

 await this.producer.send({
  topic,
  messages: [
    {
      // Ensure key is either a string, Buffer, or null (not undefined)
      key: key ? String(key) : null,

      // Handle the case where value might already be a string or is null
      value: value ? JSON.stringify(value) : null,
    },
  ],
});
  

  this.logger.log(
    `✅ Event emitted → ${topic}`,
  );
}

  // =====================================================
  // CONSUME EVENTS
  // =====================================================

async consume<T>(

  groupId: string,

  topic: string,

  handler: (
    data: T,
  ) => Promise<void>,
) {

  const consumer =
    this.kafka.consumer({
      groupId,
    });

  await consumer.connect();

  await consumer.subscribe({

    topic,

    fromBeginning: false,
  });

  await consumer.run({

    eachMessage: async ({
      message,
    }) => {

      if (!message.value) {
        return;
      }

      const parsed =
        JSON.parse(
          message.value.toString(),
        ) as T;

      await handler(parsed);
    },
  });
}

  // =====================================================
  // MODULE DESTROY
  // =====================================================

  async onModuleDestroy() {

    try {

      // ================================================
      // DISCONNECT PRODUCER
      // ================================================

      if (this.producer) {

        await this.producer.disconnect();
      }

      // ================================================
      // DISCONNECT CONSUMERS
      // ================================================

      await Promise.all(

        this.consumers.map(

          async (consumer) => {

            await consumer.disconnect();
          },
        ),
      );

      this.logger.log(
        '🛑 Kafka connections closed',
      );

    } catch (err) {

      this.logger.error(
        '❌ Kafka shutdown failed',
        err,
      );
    }
  }
}