import {
  Injectable,
} from '@nestjs/common'; 
import { RedisService } from '../../redis.service';
 

@Injectable()
export class RedisAuthRateLimitService {

  constructor(
    private readonly redis: RedisService,
  ) {}

  // =====================================================
  // LOGIN ATTEMPTS
  // =====================================================

  private loginKey(
    identifier: string,
  ) {

    return `auth:login:${identifier}`;
  }

  // =====================================================
  // OTP REQUESTS
  // =====================================================

  private otpKey(
    identifier: string,
  ) {

    return `auth:otp:${identifier}`;
  }

  // =====================================================
  // INCREMENT LOGIN ATTEMPTS
  // =====================================================

  async incrementLoginAttempts(
    identifier: string,
  ) {

    const key =
      this.loginKey(
        identifier,
      );

    const count =
      await this.redis.client
        .incr(key);

    // expire after 15 minutes
    if (count === 1) {

      await this.redis.client
        .expire(
          key,
          900,
        );
    }

    return count;
  }

  // =====================================================
  // GET LOGIN ATTEMPTS
  // =====================================================

  async getLoginAttempts(
    identifier: string,
  ) {

    const value =
      await this.redis.client
        .get(
          this.loginKey(
            identifier,
          ),
        );

    return value
      ? parseInt(value, 10)
      : 0;
  }

  // =====================================================
  // CLEAR LOGIN ATTEMPTS
  // =====================================================

  async clearLoginAttempts(
    identifier: string,
  ) {

    await this.redis.client.del(
      this.loginKey(
        identifier,
      ),
    );
  }

  // =====================================================
  // OTP RATE LIMIT
  // =====================================================

  async incrementOtpRequests(
    identifier: string,
  ) {

    const key =
      this.otpKey(
        identifier,
      );

    const count =
      await this.redis.client
        .incr(key);

    // expire after 5 mins
    if (count === 1) {

      await this.redis.client
        .expire(
          key,
          300,
        );
    }

    return count;
  }

  // =====================================================
  // GET OTP REQUEST COUNT
  // =====================================================

  async getOtpRequests(
    identifier: string,
  ) {

    const value =
      await this.redis.client
        .get(
          this.otpKey(
            identifier,
          ),
        );

    return value
      ? parseInt(value, 10)
      : 0;
  }
}