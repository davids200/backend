import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';
 

import { FollowProducer }
from './follow.producer';
import { FollowEntity } from './entities/follow.entity';

@Injectable()
export class FollowService {

  constructor(

    @InjectRepository(FollowEntity)
    private readonly repo:
      Repository<FollowEntity>,

    private readonly producer:
      FollowProducer,
  ) {}

  // =====================================================
  // FOLLOW USER
  // =====================================================

  async followUser(
    followerId: string,
    followingId: string,
  ) {

    if (
      followerId === followingId
    ) {

      throw new BadRequestException(
        'You cannot follow yourself',
      );
    }

    const existing =
      await this.repo.findOne({

        where: {
          followerId,
          followingId,
        },
      });

    if (existing) {
      return existing;
    }

    const follow =
      this.repo.create({

        followerId,

        followingId,
      });

    const saved =
      await this.repo.save(
        follow,
      );

    // ================================================
    // KAFKA EVENT
    // ================================================

    await this.producer.followCreated({

      followerId,

      followingId,
    });

    return saved;
  }

  // =====================================================
  // UNFOLLOW USER
  // =====================================================

  async unfollowUser(
    followerId: string,
    followingId: string,
  ) {

    await this.repo.delete({

      followerId,

      followingId,
    });

    // ================================================
    // KAFKA EVENT
    // ================================================

    await this.producer.followRemoved({

      followerId,

      followingId,
    });

    return true;
  }

  // =====================================================
  // GET FOLLOWERS
  // =====================================================

  async getFollowers(
    userId: string,
  ) {

    return this.repo.find({

      where: {
        followingId: userId,
      },

      order: {
        createdAt: 'DESC',
      },
    });
  }

  // =====================================================
  // GET FOLLOWING
  // =====================================================

  async getFollowing(
    userId: string,
  ) {

    return this.repo.find({

      where: {
        followerId: userId,
      },

      order: {
        createdAt: 'DESC',
      },
    });
  }
}