import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';

import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';

import { RedisPubSubService } from '../../modules/notification/pubsub/redis.pubsub.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
@Injectable()
export class NotificationGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly pubsub: RedisPubSubService,
  ) {}

  async afterInit() {
    // =========================
    // SUBSCRIBE TO REDIS CHANNEL
    // =========================
    await this.pubsub.subscribe(
      'notifications',
      (data) => {
        const { userId, payload } = data;

        // emit to specific user room
        this.server
          .to(`user:${userId}`)
          .emit('notification', payload);
      },
    );
  }



  
}