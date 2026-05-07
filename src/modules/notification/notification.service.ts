import {  Injectable,} from '@nestjs/common';
import {  InjectRepository,} from '@nestjs/typeorm';
import {  Repository,} from 'typeorm';
import { NotificationEntity } from './entities/notification.entity';

@Injectable()
export class NotificationService {

  constructor(
    @InjectRepository( NotificationEntity,)
    private readonly repo: Repository<NotificationEntity>,
  ) {}

  // =====================================================
  // CREATE NOTIFICATION
  // =====================================================

  async create(data: {
    userId: string;
    actorId?: string;
    type: string;
    referenceId?: string;
  }) {
    return this.repo.save({
      userId:data.userId,
      actorId:data.actorId,
      type:data.type,
      referenceId:data.referenceId,
    });
  }


  
  // =====================================================
  // GET USER NOTIFICATIONS
  // =====================================================
  async getUserNotifications(
    userId: string,
    limit = 20,
    offset = 0,
  ) {
    return this.repo.find({
      where: {userId,
      },
      order: {createdAt: 'DESC',
      },
      take:limit,
      skip:offset,
    });
  }

  // =====================================================
  // GET UNREAD COUNT
  // =====================================================
  async getUnreadCount(userId: string,) {
    return this.repo.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  // =====================================================
  // MARK AS READ
  // =====================================================
  async markAsRead(
    notificationId: string,
    userId: string,
  ) {
    await this.repo.update({id:notificationId, userId,},{read: true,},
    );
    return true;
  }

  // =====================================================
  // MARK ALL AS READ
  // =====================================================
  async markAllAsRead(
    userId: string,
  ) {
    await this.repo.update(
      {userId,
        read: false,
      },
      {read: true,
      },
    );
    return true;
  }
}