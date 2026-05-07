import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';

import {
  Kafka,
  Consumer,
  Producer,
  Partitioners,
  KafkaMessage,
} from 'kafkajs';

@Injectable()
export class KafkaService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger =
    new Logger(KafkaService.name);

  // =====================================================
  // KAFKA INSTANCE
  // =====================================================

  private readonly kafka = new Kafka({
    clientId: 'social-app',

    brokers: ['localhost:9092'],
  });

  // =====================================================
  // PRODUCER
  // =====================================================

  private producer!: Producer;

  // =====================================================
  // ACTIVE CONSUMERS
  // =====================================================

  private consumers: Consumer[] = [];

  // =====================================================
  // MODULE INIT
  // =====================================================

  async onModuleInit() {

    this.producer =
      this.kafka.producer({

        // Fix KafkaJS v2 partition warning
        createPartitioner:
          Partitioners.LegacyPartitioner,
      });

    await this.producer.connect();

    // this.logger.log(
    //   '✅ Kafka producer connected',
    // );
  }

  // =====================================================
  // PRODUCE EVENT
  // =====================================================

  async emit(
    topic: string,
    value: unknown,
    key?: string,
  ): Promise<void> {

    await this.producer.send({
      topic,

      messages: [
        {
          key,

          value: JSON.stringify(
            value,
          ),
        },
      ],
    });
  }

  // =====================================================
  // CONSUMER WRAPPER
  // =====================================================

 async consume(
  groupId: string,
  topic: string,
  handler: (
    message: KafkaMessage,
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

        try {

          if (!message.value) {
            return;
          }

          const parsed =
            JSON.parse(
              message.value.toString(),
            );

          await handler(parsed);

        } catch (err) {

          // this.logger.error(
          //   `Kafka consumer error (${topic})`,
          //   err,
          // );
        }
      },
    });

    // ================================================
    // TRACK CONSUMERS
    // ================================================

    this.consumers.push(
      consumer,
    );

    this.logger.log(
      `✅ Kafka consumer started: ${topic}`,
    );
  }

  // =====================================================
  // MODULE DESTROY
  // =====================================================

  async onModuleDestroy() {

    await this.producer?.disconnect();

    for (const consumer of this.consumers) {

      await consumer.disconnect();
    }

    this.logger.log(
      '🛑 Kafka connections closed',
    );
  }
}