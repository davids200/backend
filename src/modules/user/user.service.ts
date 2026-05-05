import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { UserEntity } from './entities/user.entity';
import { UserProfileEntity } from './entities/user-profile.entity';
import { UserEducationEntity } from './entities/user-education.entity';
import { UserSessionEntity } from './entities/user-session.entity';
import { LocationProducer } from '../../infrastructure/kafka/producers/location.producer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,

    @InjectRepository(UserProfileEntity)
    private profileRepo: Repository<UserProfileEntity>,

    @InjectRepository(UserEducationEntity)
    private eduRepo: Repository<UserEducationEntity>,

    @InjectRepository(UserSessionEntity)
    private sessionRepo: Repository<UserSessionEntity>,

    private readonly locationProducer: LocationProducer,
  ) {}

  // =========================
  // CREATE USER
  // =========================
  async createUser(data: Partial<UserEntity>) {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  // =========================
  // GET USER
  // =========================
  async getUser(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  // =========================
  // BULK USERS (SCALING)
  // =========================
  async getUsersByIds(ids: string[]) {
    return this.userRepo.find({
      where: { id: In(ids) },
    });
  }

  // =========================
  // PROFILE
  // =========================
async updateProfile(userId: string, data: Partial<UserProfileEntity>) {
let profile = await this.profileRepo.findOne({ where: { userId } });

if (!profile) {
profile = this.profileRepo.create({ userId, ...data });
} else {
Object.assign(profile, data);
}

return this.profileRepo.save(profile);
}






  async getProfile(userId: string) {
    return this.profileRepo.findOne({ where: { userId } });
  }







  // =========================
  // EDUCATION
  // =========================
  async addEducation(userId: string, data: Partial<UserEducationEntity>) {
    const edu = this.eduRepo.create({ userId, ...data });
    return this.eduRepo.save(edu);
  }

  async getEducation(userId: string) {
    return this.eduRepo.find({ where: { userId } });
  }







  // =========================
  // SESSION
  // =========================
  async createSession(data: Partial<UserSessionEntity>) {
    return this.sessionRepo.save(this.sessionRepo.create(data));
  }

  async deleteSession(token: string) {
    return this.sessionRepo.delete({ refreshToken: token });
  }


// 📁 src/modules/user/user.service.ts

async updateLocation(userId: string, newLocationId: string) {
  const user = await this.userRepo.findOne({
    where: { id: userId },
  });

  if (!user) throw new Error('User not found');

  const oldLocationId = user.locationId;

  // update DB
  user.locationId = newLocationId;
  await this.userRepo.save(user);

  // ✅ ONLY EMIT IF OLD LOCATION EXISTS
  if (oldLocationId) {
    await this.locationProducer.locationUpdated({
      userId,
      oldLocationId,
      newLocationId,
    });
  } else {
    // first-time location set
    await this.locationProducer.locationInitialized({
      userId,
      newLocationId,
    });
  }

  return user;
}
  
}