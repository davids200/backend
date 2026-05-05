import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class LocationRedisService {
  private redis = new Redis();

  // =========================
  // ADD USER TO LOCATION
  // =========================
  async addUserToLocation(locationId: string, userId: string) {
    await this.redis.sadd(`location:${locationId}:users`, userId);
  }

  // =========================
  // REMOVE USER FROM LOCATION
  // =========================
  async removeUserFromLocation(locationId: string, userId: string) {
    await this.redis.srem(`location:${locationId}:users`, userId);
  }

  // =========================
  // GET USERS IN LOCATION
  // =========================
  async getUsers(locationId: string): Promise<string[]> {
    return this.redis.smembers(`location:${locationId}:users`);
  }

  // =========================
  // COUNT USERS
  // =========================
  async countUsers(locationId: string): Promise<number> {
    return this.redis.scard(`location:${locationId}:users`);
  }

  // =========================
  // MULTI-LEVEL FETCH (IMPORTANT)
  // =========================
  async getUsersAcrossLocations(locationIds: string[]) {
    const pipeline = this.redis.pipeline();

    locationIds.forEach((id) => {
      pipeline.smembers(`location:${id}:users`);
    });

    const results = await pipeline.exec();

    return results?.flatMap((r) => r[1] as string[]) || [];
  }
}