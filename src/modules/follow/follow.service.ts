import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import { FollowProducer }
from './follow.producer';

import { FollowEntity }
from './entities/follow.entity';
import { UserEntity } from '../user/entities/user.entity';
 
@Injectable()
export class FollowService {

  constructor(

    @InjectRepository(FollowEntity)
    private readonly repo:
      Repository<FollowEntity>,

    @InjectRepository(UserEntity)
    private readonly usersRepo:
      Repository<UserEntity>,

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

    // ================================================
    // SELF FOLLOW
    // ================================================

    if (
      followerId === followingId
    ) {

      throw new BadRequestException(
        'You cannot follow yourself',
      );
    }

    // ================================================
    // TARGET USER
    // ================================================

    const targetUser =
      await this.usersRepo.findOne({

        where: {
          id: followingId,
        },
      });

    if (!targetUser) {

      throw new NotFoundException(
        'User not found',
      );
    }

    // ================================================
    // PRIVATE ACCOUNT
    // ================================================

    if (targetUser.isPrivate) {

      throw new BadRequestException(
        'Follow request required',
      );
    }

    // ================================================
    // EXISTING FOLLOW
    // ================================================

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

    // ================================================
    // CREATE FOLLOW
    // ================================================

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