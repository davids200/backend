import {Injectable,Logger,OnModuleInit,} from '@nestjs/common';
import {InjectRepository,} from '@nestjs/typeorm';
import { Repository,} from 'typeorm';

import { KafkaService } from '../../infrastructure/kafka/kafka.service';
import { RedisCounterService } from '../../infrastructure/redis/counters/redis.counter.service';

import { FollowEntity } from '../../modules/follow/entities/follow.entity';
import { NotificationProducer } from '../../modules/notification/notification.producer';
import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';

@Injectable()
export class FollowConsumer  implements OnModuleInit{
  private readonly logger =    new Logger(      FollowConsumer.name,    );
  constructor(
        @InjectRepository(      FollowEntity,    )
    private readonly repo:      Repository<FollowEntity>,
    private readonly kafka:      KafkaService,
    private readonly counters:   RedisCounterService,
    private readonly notification:  NotificationProducer,
  ) {}

async onModuleInit() {
  await this.start();
}


  
private async start() {
await this.kafka.consume('follow-group',KAFKA_TOPICS.FOLLOW_CREATED,
async (message) => {
if (!message.value) {
return;
}
try {
const event = JSON.parse(message.value.toString(),);
await this.handleFollowCreated(event,);
} catch (err) {
this.logger.error(
'Follow created error',
err,
);
}
},
);


// FOLLOW REMOVED 
await this.kafka.consume('follow-group',KAFKA_TOPICS.FOLLOW_REMOVED,async (message) => {
if (!message.value) {
return;
}
try {
const event =JSON.parse(message.value.toString(),);
await this.handleFollowRemoved(event,);
} catch (err) {
this.logger.error(
'Follow removed error',
err,
);
}
},
);
this.logger.log(
'✅ FollowConsumer started',
);
}


// HANDLE FOLLOW CREATED
private async handleFollowCreated(event: {followerId: string;followingId: string;createdAt: string;}) {
const {followerId,followingId,} = event;

// SAVE FOLLOW 
await this.repo.save({followerId,followingId,});

// UPDATE COUNTERS
await Promise.all([this.counters.incrementFollowers(followingId,),this.counters.incrementFollowing(followerId,),]);

// SEND NOTIFICATION
if (followerId !==followingId) {
await this.notification.sendNotification({
userId:followingId,
actorId:followerId,
type:'follow',
referenceId:followerId,
createdAt:new Date().toISOString(),
});
}
this.logger.log(`Follow created: ${followerId} -> ${followingId}`,);
}




 
// HANDLE FOLLOW REMOVED
private async handleFollowRemoved(event: {followerId: string; followingId: string;}) {
const { followerId, followingId,} = event;

// DELETE FOLLOW 
await this.repo.delete({followerId,followingId,});

// UPDATE COUNTERS 
await Promise.all([this.counters.decrementFollowers(followingId,),this.counters.decrementFollowing(followerId,),]);
this.logger.log(`Follow removed: ${followerId} -> ${followingId}`,);
}
}