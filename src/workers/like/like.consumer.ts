import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

import { LikeEntity }
from '../../modules/like/like.entity';

import { RedisCounterService }
from '../../infrastructure/redis/counters/redis.counter.service';

import { NotificationProducer }
from '../../modules/notification/notification.producer';
import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';

@Injectable()
export class LikeConsumer
  implements OnModuleInit
{
  private readonly logger =
    new Logger(
      LikeConsumer.name,
    );

  constructor(

    // =====================================================
    // REPOSITORIES
    // =====================================================

    @InjectRepository(
      LikeEntity,
    )
    private readonly repo:
      Repository<LikeEntity>,

    // =====================================================
    // SERVICES
    // =====================================================

    private readonly kafka:
      KafkaService,

    private readonly redisCounter:
      RedisCounterService,

    private readonly notification:
      NotificationProducer,
  ) {}

  async onModuleInit() {

    await this.start();
  }




// =====================================================
// START CONSUMER
// =====================================================

private async start() {


// LIKE CREATED
// ================================================
// This line is basically, the:“event listener” of  Like domain.
// It tells Kafka:
// "When a like.created event arrives,
// run this code."
await this.kafka.consume('like-group',KAFKA_TOPICS.LIKE_CREATED,async (message) => {
if (!message.value) {
return;
}
try {
const event = JSON.parse(message.value.toString(),);
await this.handleLikeCreated(event,);
} catch (err) {
this.logger.error('Like created error',err,);
}
},
);



  // LIKE REMOVED
// ================================================
// This line is basically, the:“event listener” of  Like domain.
// It tells Kafka:
// "When a like.removed event arrives,
// run this code."
await this.kafka.consume('like-group','like.removed',async (message) => {
if (!message.value) {return;}
try {
const event =JSON.parse(message.value.toString(),);
await this.handleLikeRemoved(event,);
} catch (err) {
this.logger.error('Like removed error',err,);
}
},
);
this.logger.log('✅ LikeConsumer started',);
}



  // =====================================================
  // HANDLE LIKE CREATED
  // =====================================================
private async handleLikeCreated(event: {
userId: string;
targetId: string;
targetType: 'post' | 'comment';
authorId?: string;
}) {
const {
userId,
targetId,
targetType,
authorId,
} = event;




// ================================================
// STORE LIKE
// ================================================
const existing = await this.repo.findOne({ where: {userId,targetId,targetType,},});
if (existing) {return;}
await this.repo.save({
userId,
targetId,
targetType,
});


// ================================================
// UPDATE COUNTERS BY REDIS
// ================================================
await this.redisCounter.incrementLikes(targetType,targetId,);


// ================================================
// CREATE NOTIFICATION   //// EVENT TO KAFKA PRODUCER
// ================================================
if (authorId && authorId !== userId) {
await this.notification.sendNotification({  ////notification Producer
userId:authorId,
actorId:userId,
type:`${targetType}_like`,
referenceId:targetId,
createdAt:new Date().toISOString(),
});
}
this.logger.log(`Like created: ${targetId}`,);
}




  // =====================================================
  // HANDLE LIKE REMOVED
  // =====================================================
private async handleLikeRemoved(event: {
userId: string;
targetId: string;
targetType: 'post' | 'comment';
}) {
const {
userId,
targetId,
targetType,
} = event;




// ================================================
// DELETE LIKE
// ================================================
await this.repo.delete({userId,targetId,targetType,});



// ================================================
// UPDATE COUNTERS
// ================================================
await this.redisCounter.decrementLikes(targetType,targetId,);
this.logger.log(`Like removed: ${targetId}`,);
}



}