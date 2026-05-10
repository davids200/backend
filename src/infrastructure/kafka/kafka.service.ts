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

    try {

      this.logger.log(
        `📤 Emitting → ${topic}`,
      );

      await this.producer.send({

        topic,

        messages: [
          {

            key,

            value:
              JSON.stringify(
                value,
              ),
          },
        ],
      });

      this.logger.log(
        `✅ Event emitted → ${topic}`,
      );

    } catch (err) {

      this.logger.error(
        `❌ Emit failed (${topic})`,
        err,
      );

      throw err;
    }
  }

  // =====================================================
  // CONSUME EVENTS
  // =====================================================

  async consume<T>(

    groupId: string,

    topic: string,

    handler: (
      payload: T,
    ) => Promise<void>,
  ): Promise<void> {

    try {

      this.logger.log(
        `👂 Creating consumer → ${topic}`,
      );

      const consumer =
        this.kafka.consumer({

          groupId,
        });

      this.consumers.push(
        consumer,
      );

      // ================================================
      // CONNECT
      // ================================================

      await consumer.connect();

      this.logger.log(
        `✅ Consumer connected → ${topic}`,
      );

      // ================================================
      // SUBSCRIBE
      // ================================================

      await consumer.subscribe({

        topic,

        fromBeginning: false,
      });

      this.logger.log(
        `✅ Subscribed → ${topic}`,
      );

      // ================================================
      // RUN
      // ================================================

      consumer.run({

        eachMessage: async ({
          message,
        }) => {

          try {

            if (!message.value) {
              return;
            }

            this.logger.log(
              `🔥 Event received → ${topic}`,
            );

            const raw =
              message.value.toString();

            this.logger.debug(
              raw,
            );

            // ==========================================
            // PARSE
            // ==========================================

            const payload =
              JSON.parse(
                raw,
              ) as T;

            // ==========================================
            // HANDLE
            // ==========================================

            await handler(
              payload,
            );

          } catch (err) {

            this.logger.error(
              `❌ Consume failed (${topic})`,
              err,
            );
          }
        },
      });

      this.logger.log(
        `🚀 Consumer running → ${topic}`,
      );

    } catch (err) {

      this.logger.error(
        `❌ Consumer startup failed (${topic})`,
        err,
      );

      throw err;
    }
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