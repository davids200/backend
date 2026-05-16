import { Injectable,OnModuleInit } from '@nestjs/common';

import { Kafka }
from 'kafkajs';

import { RedisCounterService }
from '../../infrastructure/redis/counters/redis.counter.service';

import { NotificationProducer }
from '../../modules/notification/notification.producer';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';

@Injectable()
export class CommentConsumer implements OnModuleInit {

  private kafka = new Kafka({
    clientId:'social-app',
    brokers:['localhost:9092'],
  });

  private consumer =
    this.kafka.consumer({
      groupId:'comment-group',
    });

  constructor(

    private readonly counter:
      RedisCounterService,

    private readonly notification:
      NotificationProducer,

    private readonly kafkaService:
      KafkaService,
  ) {}

  async onModuleInit(){
console.log(
  'STARTING COMMENT CONSUMER',
);

    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: KAFKA_TOPICS.COMMENT_CREATED,
      fromBeginning:false,
    });
    await this.consumer.run({
      eachMessage:
        async ({ message }) => {
          if (!message.value){
            return;
          }

          const event = JSON.parse(message.value.toString(),);

          // =========================================
          // 1. INCREMENT COMMENTS
          // =========================================
          await this.counter.incrementComments(
            event.postId,
          );

           
          // 2. GET UPDATED COUNT
          // =========================================
          const comments = await this.counter.getCommentsCount(event.postId,);

         
          // 3. EMIT RANKING EVENT
          // =========================================
          await this.kafkaService.emit(KAFKA_TOPICS.ENGAGEMENT_UPDATED,  {

              postId: event.postId,
              likes:0,
              comments,
              reposts:0,
              bookmarks:0,
              views:0,
              dwellTimeMs:0,
              completionRate:0,
              createdAt:new Date().toISOString(),
              authorId:event.authorId,
            },
          );

         
          // 4. NOTIFICATION
          // =========================================
          await this.notification.sendNotification({
              userId:event.userId,
              type:'COMMENT',
              referenceId:event.postId,
              actorId:event.userId,
              createdAt:new Date().toISOString(),
            });

          console.log('💬 COMMENT RANK UPDATED',event.postId,);
        },
    });
  }
}