import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
  In,
} from 'typeorm';

import { UserEntity }
from './entities/user.entity';

import { UserProfileEntity }
from './entities/user-profile.entity';

import { UserEducationEntity }
from './entities/user-education.entity';

import { UserSessionEntity }
from './entities/user-session.entity';

import { LocationProducer }
from '../location/location.producer';

@Injectable()
export class UserService {
  private readonly logger =
    new Logger(UserService.name);

  constructor(

    @InjectRepository(UserEntity)
    private readonly userRepo:
      Repository<UserEntity>,

    @InjectRepository(UserProfileEntity)
    private readonly profileRepo:
      Repository<UserProfileEntity>,

    @InjectRepository(UserEducationEntity)
    private readonly educationRepo:
      Repository<UserEducationEntity>,

    @InjectRepository(UserSessionEntity)
    private readonly sessionRepo:
      Repository<UserSessionEntity>,

    private readonly locationProducer:
      LocationProducer,
  ) {}

  // =====================================================
  // CREATE USER
  // =====================================================

  async createUser(
    data: Partial<UserEntity>,
  ) {

    const user =
      this.userRepo.create(data);

    return this.userRepo.save(user);
  }

  // =====================================================
  // GET USER
  // =====================================================

  async getUser(id: string) {

    return this.userRepo.findOne({
      where: { id },
    });
  }

  // =====================================================
  // BULK USERS
  // =====================================================

  async getUsersByIds(
    ids: string[],
  ) {

    if (!ids.length) {
      return [];
    }

    return this.userRepo.find({
      where: {
        id: In(ids),
      },
    });
  }

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  async updateProfile(
    userId: string,
    data: Partial<UserProfileEntity>,
  ) {

    let profile =
      await this.profileRepo.findOne({
        where: { userId },
      });

    if (!profile) {

      profile =
        this.profileRepo.create({
          userId,
          ...data,
        });

    } else {

      Object.assign(
        profile,
        data,
      );
    }

    return this.profileRepo.save(
      profile,
    );
  }

  // =====================================================
  // GET PROFILE
  // =====================================================

  async getProfile(
    userId: string,
  ) {

    return this.profileRepo.findOne({
      where: { userId },
    });
  }

  // =====================================================
  // ADD EDUCATION
  // =====================================================

  async addEducation(
    userId: string,
    data: Partial<UserEducationEntity>,
  ) {

    const education =
      this.educationRepo.create({
        userId,
        ...data,
      });

    return this.educationRepo.save(
      education,
    );
  }

  // =====================================================
  // GET EDUCATION
  // =====================================================

  async getEducation(
    userId: string,
  ) {

    return this.educationRepo.find({
      where: { userId },
    });
  }

  // =====================================================
  // CREATE SESSION
  // =====================================================

  async createSession(
    data: Partial<UserSessionEntity>,
  ) {

    const session =
      this.sessionRepo.create(data);

    return this.sessionRepo.save(
      session,
    );
  }

  // =====================================================
  // DELETE SESSION
  // =====================================================

  async deleteSession(
    refreshToken: string,
  ) {

    return this.sessionRepo.delete({
      refreshToken,
    });
  }

  // =====================================================
  // UPDATE LOCATION
  // =====================================================

  async updateLocation(
    userId: string,
    newLocationId: string,
  ) {

    const user =
      await this.userRepo.findOne({
        where: { id: userId },
      });

    if (!user) {

      throw new NotFoundException(
        'User not found',
      );
    }

    const oldLocationId =
      user.locationId;

    // ================================================
    // UPDATE DATABASE
    // ================================================

    user.locationId =
      newLocationId;

    await this.userRepo.save(user);

    // ================================================
    // LOCATION INITIALIZED
    // ================================================

    if (!oldLocationId) {

      await this.locationProducer
        .locationInitialized({
          userId,
          newLocationId,
        });

      this.logger.log(
        `Location initialized for ${userId}`,
      );

      return user;
    }

    // ================================================
    // LOCATION UPDATED
    // ================================================

    if (
      oldLocationId !==
      newLocationId
    ) {

      await this.locationProducer
        .locationUpdated({
          userId,
          oldLocationId,
          newLocationId,
        });

      this.logger.log(
        `Location updated for ${userId}`,
      );
    }

    return user;
  }
}