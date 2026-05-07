import {
  Injectable,
} from '@nestjs/common';

import { RedisService }
from '../redis.service';

@Injectable()
export class RedisOtpService {
  constructor(
    private readonly redis: RedisService,
  ) {}

  // =====================================================
  // OTP KEY
  // =====================================================

  private otpKey(
    type: 'email' | 'phone',
    value: string,
  ) {

    return `otp:${type}:${value}`;
  }

  // =====================================================
  // ATTEMPT KEY
  // =====================================================

  private attemptKey(
    type: 'email' | 'phone',
    value: string,
  ) {

    return `otp_attempts:${type}:${value}`;
  }

  // =====================================================
  // SAVE OTP
  // =====================================================

  async saveOtp(params: {
    type: 'email' | 'phone';
    value: string;
    otp: string;
    ttlSeconds?: number;
  }) {

    const {
      type,
      value,
      otp,
      ttlSeconds = 300,
    } = params;

    await this.redis.client.set(
      this.otpKey(type, value),
      otp,

      'EX',
      ttlSeconds,
    );
  }

  // =====================================================
  // GET OTP
  // =====================================================

  async getOtp(params: {
    type: 'email' | 'phone';
    value: string;
  }) {

    const {
      type,
      value,
    } = params;

    return this.redis.client.get(
      this.otpKey(type, value),
    );
  }

  // =====================================================
  // DELETE OTP
  // =====================================================

  async deleteOtp(params: {
    type: 'email' | 'phone';
    value: string;
  }) {

    const {
      type,
      value,
    } = params;

    await this.redis.client.del(
      this.otpKey(type, value),
    );
  }

  // =====================================================
  // ATTEMPT COUNTER
  // =====================================================

  async incrementAttempts(params: {
    type: 'email' | 'phone';
    value: string;
  }) {

    const {
      type,
      value,
    } = params;

    const key =
      this.attemptKey(type, value);

    const attempts =
      await this.redis.client.incr(
        key,
      );

    // expire attempts after 5 minutes
    if (attempts === 1) {

      await this.redis.client.expire(
        key,
        300,
      );
    }

    return attempts;
  }

  // =====================================================
  // GET ATTEMPTS
  // =====================================================

  async getAttempts(params: {
    type: 'email' | 'phone';
    value: string;
  }) {

    const {
      type,
      value,
    } = params;

    const attempts =
      await this.redis.client.get(
        this.attemptKey(type, value),
      );

    return attempts
      ? parseInt(attempts, 10)
      : 0;
  }

  // =====================================================
  // CLEAR ATTEMPTS
  // =====================================================

  async clearAttempts(params: {
    type: 'email' | 'phone';
    value: string;
  }) {

    const {
      type,
      value,
    } = params;

    await this.redis.client.del(
      this.attemptKey(type, value),
    );
  }
}