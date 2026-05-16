import {  Injectable,  UnauthorizedException,  BadRequestException,} from '@nestjs/common';
import {  InjectRepository,} from '@nestjs/typeorm';
import {  Repository,} from 'typeorm';
import {  JwtService,} from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomUUID }from 'crypto';
import {  AuthIdentityEntity,  AuthProvider,} from './entities/auth-identity.entity';
import { AuthSessionEntity }from './entities/auth-session.entity';
import { UserService }from '../user/user.service';
import { LoginInput }from './dto/login.input';
import { RegisterInput }from './dto/register.input';
import { JwtPayload }from './interfaces/jwt-payload.interface';
import { hashPassword }from './utils/hash-password.util'; 

import { RedisOtpService }from '../../infrastructure/redis/otp/redis.otp.service';
import { RedisAuthRateLimitService }from '../../infrastructure/redis/auth/redis.auth-rate-limit.service';
import { AuthProducer }from './auth.producer';
import { AuthSecurityService }from './security/auth-security.service';
import { DeviceInfo } from './device/device.types';
import { NotificationProducer } from '../notification/notification.producer';
import { SessionCacheService } from './services/session-cache.service';
import { generateOtp } from './utils/generate-otp.util';
import { verifyPassword } from './utils/verify-password.util';
import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(      AuthIdentityEntity,    )
    private readonly identityRepo:      Repository<AuthIdentityEntity>,
    @InjectRepository(      AuthSessionEntity,    )
    private readonly sessionRepo:      Repository<AuthSessionEntity>,
    private readonly notificationProducer:NotificationProducer,
    private readonly sessionCache:  SessionCacheService,

    // =====================================================
    // SERVICES
    // =====================================================

    private readonly users:
      UserService,

    private readonly jwt:
      JwtService,

    private readonly redisOtp:
      RedisOtpService,

    private readonly authRateLimit:
      RedisAuthRateLimitService,

    private readonly authProducer:
      AuthProducer,

    private readonly security:
      AuthSecurityService,
  ) {}

  // =====================================================
  // REGISTER
  // =====================================================

  async register(
    data: RegisterInput,
  ) {

    // ================================================
    // REQUIRE LOGIN METHOD
    // ================================================

    if (
      !data.email &&
      !data.phone
    ) {

      throw new BadRequestException(
        'Email or phone required',
      );
    }

    // ================================================
    // REQUIRE PASSWORD
    // ================================================

    if (!data.password) {

      throw new BadRequestException(
        'Password required',
      );
    }

    // ================================================
    // CHECK EMAIL
    // ================================================

    if (data.email) {

      const existing =
        await this.identityRepo.findOne({
          where: {
            provider:
              AuthProvider.EMAIL,

            providerUserId:
              data.email,
          },
        });

      if (existing) {

        throw new BadRequestException(
          'Email already exists',
        );
      }
    }

    // ================================================
    // CHECK PHONE
    // ================================================

    if (data.phone) {

      const existing =
        await this.identityRepo.findOne({
          where: {
            provider:
              AuthProvider.PHONE,

            providerUserId:
              data.phone,
          },
        });

      if (existing) {

        throw new BadRequestException(
          'Phone already exists',
        );
      }
    }

    // ================================================
    // CREATE USER
    // ================================================

    const user =
      await this.users.createUser({

        username:
          data.username,

        displayName:
          data.displayName ||
          data.username,

        onboardingCompleted:
          false,
      });

    // ================================================
    // HASH PASSWORD
    // ================================================

    const passwordHash =
      await hashPassword(
        data.password,
      );

    // ================================================
    // CREATE EMAIL IDENTITY
    // ================================================

    if (data.email) {

      await this.identityRepo.save({

        userId:
          user.id,

        provider:
          AuthProvider.EMAIL,

        providerUserId:
          data.email,

        email:
          data.email,

        passwordHash,

        isVerified:
          false,
      });
    }

    // ================================================
    // CREATE PHONE IDENTITY
    // ================================================

    if (data.phone) {

      await this.identityRepo.save({

        userId:
          user.id,

        provider:
          AuthProvider.PHONE,

        providerUserId:
          data.phone,

        phone:
          data.phone,

        passwordHash,

        isVerified:
          false,
      });
    }

    // ================================================
    // AUTO LOGIN
    // ================================================

    return this.generateTokens(
      user.id,
    );
  }

  // =====================================================
  // LOGIN
  // =====================================================

async login(data: LoginInput,deviceInfo?: DeviceInfo,)  {

console.log("LoginInput",data)
console.log("deviceInfo",deviceInfo)
// ================================================
// RATE LIMIT
// ================================================
const attempts =await this.authRateLimit.getLoginAttempts(data.login,);
if (attempts >= 5) {
throw new UnauthorizedException(
'Too many login attempts',
);
}

    // ================================================
    // FIND IDENTITY
    // ================================================

    const identity =
      await this.identityRepo.findOne({
        where: [
          {
            provider:AuthProvider.EMAIL,
            providerUserId:data.login,
          },
          {
            provider:AuthProvider.PHONE,
            providerUserId:data.login,
          },
        ],
      });

    if (
      !identity ||  !identity.passwordHash
    ) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    // ================================================
    // VERIFY PASSWORD
    // ================================================

   const valid =
  await verifyPassword(
    data.password,
    identity.passwordHash,
  );

    if (!valid) {

      await this.authRateLimit
        .incrementLoginAttempts(
          data.login,
        );

      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    // ================================================
    // CLEAR RATE LIMIT
    // ================================================

    await this.authRateLimit
      .clearLoginAttempts(
        data.login,
      );

    // ================================================
    // ISSUE TOKENS
    // ================================================

   return this.generateTokens(
  identity.userId,
  deviceInfo,
);
  }







 
  // GENERATE TOKENS
  // =====================================================

  async generateTokens(
  userId: string,
  deviceInfo?: DeviceInfo,
)
  {

    // ================================================
    // SESSION
    // ================================================

    const sessionId =
      randomUUID();

    // ================================================
    // ACCESS TOKEN
    // ================================================

    const accessToken =
      await this.jwt.signAsync({

        sub:
          userId,

        sessionId,
      });

    // ================================================
    // REFRESH TOKEN
    // ================================================

    const refreshToken =
      await this.jwt.signAsync(
        {
          sub:
            userId,

          sessionId,
        },
        {
          secret:
            process.env
              .JWT_REFRESH_SECRET,

          expiresIn:
            '30d',
        },
      );

    // ================================================
    // HASH REFRESH TOKEN
    // ================================================

    const refreshTokenHash =
      await hashPassword(
        refreshToken,
      );

    // ================================================
    // LOAD PREVIOUS SESSIONS
    // ================================================

    const previousSessions =
      await this.sessionRepo.find({
        where: {
          userId,
        },
      });

// SECURITY CHECK
const suspicious =
this.security.isSuspicious({
currentCountry:deviceInfo?.country,
currentBrowser:deviceInfo?.browser,
currentPlatform:deviceInfo?.platform,
previousSessions,
});




  // STORE SESSION 
await this.sessionRepo.save({
  sessionId,
  userId,
  refreshTokenHash,
  suspicious,
  revoked:false,
  ipAddress:deviceInfo?.ipAddress,
  browser:deviceInfo?.browser,
  platform:deviceInfo?.platform,
  deviceName:deviceInfo?.deviceName,
});

await this.sessionCache.cacheSession(sessionId,userId,); //CACHE SESSION AFTER LOGIN

 
    // EMIT SECURITY EVENT
    if (suspicious) {
      await this.authProducer.suspiciousLogin({userId,sessionId,});
    }

    // ================================================
    // LOAD USER
    // ================================================

    const user =      await this.users.getUser(userId,      );

    // ================================================
    // RESPONSE
    // ================================================

    return {

      accessToken,

      refreshToken,

      user: {

        id:
          user?.id,

        username:
          user?.username,

        displayName:
          user?.displayName,

        avatar:
          user?.avatar,

        bio:
          user?.bio,

        locationId:
          user?.locationId,

        isVerified:
          user?.isVerified,

        onboardingCompleted:
          user?.onboardingCompleted,
      },
    };
  }

  // =====================================================
  // CURRENT USER
  // =====================================================

  async getMe(
    userId: string,
  ) {

    const user =
      await this.users.getUser(
        userId,
      );

    if (!user) {
      return null;
    }

    return {

      id:
        user.id,

      username:
        user.username,

      displayName:
        user.displayName,

      avatar:
        user.avatar,

      bio:
        user.bio,

      locationId:
        user.locationId,

      isVerified:
        user.isVerified,

      onboardingCompleted:
        user.onboardingCompleted,
    };
  }

  // =====================================================
  // REFRESH TOKEN
  // =====================================================

  async refreshToken(
    refreshToken: string,
  ) {

    // ================================================
    // VERIFY TOKEN
    // ================================================

    const payload =
      await this.jwt.verifyAsync<
        JwtPayload
      >(
        refreshToken,
        {
          secret:
            process.env
              .JWT_REFRESH_SECRET,
        },
      );

    // ================================================
    // FIND ACTIVE SESSIONS
    // ================================================

    const sessions =
      await this.sessionRepo.find({
        where: {

          userId:
            payload.sub,

          revoked:
            false,
        },
      });

    // ================================================
    // FIND MATCHING SESSION
    // ================================================

    let validSession:
      AuthSessionEntity | null =
        null;

    for (const session of sessions) {

      const valid =
        await argon2.verify(
          session.refreshTokenHash,
          refreshToken,
        );

      if (valid) {

        validSession =
          session;

        break;
      }
    }

    if (!validSession) {

      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    // ================================================
    // REVOKE OLD SESSION
    // ================================================

    validSession.revoked =
      true;

    await this.sessionRepo.save(
      validSession,
    );

    // ================================================
    // ISSUE NEW TOKENS
    // ================================================

    return this.generateTokens(
      payload.sub,
    );
  }

  // =====================================================
  // LOGOUT
  // =====================================================

async logout(
  sessionId: string,
) {

  // ============================================
  // FIND SESSION
  // ============================================

  const session =
    await this.sessionRepo.findOne({

      where: {
        sessionId,
      },
    });

  // ============================================
  // SESSION NOT FOUND
  // ============================================

  if (!session) {
    return true;
  }

  // ============================================
  // REVOKE SESSION
  // ============================================

  session.revoked = true;

  session.lastSeenAt =
    new Date();

  await this.sessionRepo.save(
    session,
  );

  // ============================================
  // REMOVE REDIS CACHE
  // ============================================

  await this.sessionCache
    .removeSession(
      sessionId,
    );

  return true;
}

  // =====================================================
  // SEND OTP
  // =====================================================

  async sendOtp(data: {
    type: 'email' | 'phone';
    value: string;
  }) {

    // ================================================
    // OTP RATE LIMIT
    // ================================================

    const requests =
      await this.authRateLimit
        .getOtpRequests(
          data.value,
        );

    if (
      requests >=
      Number(
        process.env
          .OTP_ATTEMPTS,
      )
    ) {

      throw new BadRequestException(
        'Too many OTP requests',
      );
    }

    // ================================================
    // INCREMENT COUNTER
    // ================================================

    await this.authRateLimit
      .incrementOtpRequests(
        data.value,
      );

    // ================================================
    // GENERATE OTP
    // ================================================

    const otp =
      generateOtp();

    // ================================================
    // STORE OTP
    // ================================================

    await this.redisOtp.saveOtp({

      type:
        data.type,

      value:
        data.value,

      otp,
    });

    // ================================================
    // EMIT EVENT
    // ================================================

    this.notificationProducer.emit(KAFKA_TOPICS.NOTIFICATION_OTP_REQUESTED,{
      type: data.type,value: data.value,  },
);

    // ================================================
    // TEMP LOG
    // ================================================

    console.log(
      `OTP for ${data.value}: ${otp}`,
    );

    return true;
  }

  // =====================================================
  // VERIFY OTP
  // =====================================================

async verifyOtp(data: {
type: 'email' | 'phone';
value: string;
otp: string;
}) {

// ================================================
// CHECK ATTEMPTS
// ================================================
const attempts =  await this.redisOtp.getAttempts({
type:data.type,
value:data.value,
});

if (attempts >=Number(process.env.MAXIMUM_LOGIN_ATTEMPT,)) {
  throw new UnauthorizedException('Too many attempts',);
}

    
// GET STORED OTP
// ================================================
const storedOtp = await this.redisOtp.getOtp({
type:data.type,
value:data.value,
});

 
// INVALID OTP
// ================================================

if (!storedOtp || storedOtp !== data.otp) {
await this.redisOtp.incrementAttempts({
type: data.type,
value:data.value,
});
throw new UnauthorizedException(
'Invalid OTP',
);
}

     
// FIND IDENTITY
// ================================================

const identity =
  await this.identityRepo.findOne({
    where: [
      {
        provider:
          data.type === 'email'
            ? AuthProvider.EMAIL
            : AuthProvider.PHONE,

        providerUserId:
          data.value,
      },
    ],
  });



    
// MARK VERIFIED
// ================================================

if (identity) {

identity.isVerified =
  true;

await this.identityRepo.save(
  identity,
);
}

   


    // CLEANUP
    // ================================================
await this.redisOtp.deleteOtp({
  type:data.type,
  value:data.value,
});
await this.redisOtp.clearAttempts({
    type:data.type,
    value:data.value,
  });
return true;
}

  

  // REQUEST PASSWORD RESET
  // =====================================================
  async requestPasswordReset(data: {
    type: 'email' | 'phone';
    value: string;
  }) {

    const identity =
      await this.identityRepo.findOne({
        where: [
          {
            provider:
              data.type === 'email'
                ? AuthProvider.EMAIL
                : AuthProvider.PHONE,

            providerUserId:
              data.value,
          },
        ],
      });

    // silent fail
    if (!identity) {
      return true;
    }

    await this.sendOtp({

      type:
        data.type,

      value:
        data.value,
    });

    return true;
  }

  // =====================================================
  // RESET PASSWORD
  // =====================================================

  async resetPassword(data: {
    type: 'email' | 'phone';
    value: string;
    otp: string;
    newPassword: string;
  }) {

    // ================================================
    // VERIFY OTP
    // ================================================

    const storedOtp =
      await this.redisOtp.getOtp({

        type:
          data.type,

        value:
          data.value,
      });

    if (
      !storedOtp ||
      storedOtp !== data.otp
    ) {

      throw new UnauthorizedException(
        'Invalid OTP',
      );
    }

    // ================================================
    // FIND IDENTITY
    // ================================================

    const identity =
      await this.identityRepo.findOne({
        where: [
          {
            provider:
              data.type === 'email'
                ? AuthProvider.EMAIL
                : AuthProvider.PHONE,

            providerUserId:
              data.value,
          },
        ],
      });

    if (!identity) {

      throw new UnauthorizedException(
        'Identity not found',
      );
    }

    // ================================================
    // HASH PASSWORD
    // ================================================

    identity.passwordHash =
      await hashPassword(
        data.newPassword,
      );

    await this.identityRepo.save(
      identity,
    );

    // ================================================
    // DELETE OTP
    // ================================================

    await this.redisOtp.deleteOtp({

      type:
        data.type,

      value:
        data.value,
    });

    // ================================================
    // REVOKE SESSIONS
    // ================================================

    await this.sessionRepo.update(
      {
        userId:
          identity.userId,
      },
      {
        revoked:
          true,
      },
    );

    return true;
  }

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  async loginWithGoogle(data: {
    providerUserId: string;
    email?: string;
    displayName?: string;
    avatar?: string;
  }) {

    // ================================================
    // FIND GOOGLE IDENTITY
    // ================================================

    let identity =
      await this.identityRepo.findOne({
        where: {

          provider:
            AuthProvider.GOOGLE,

          providerUserId:
            data.providerUserId,
        },
      });

    // ================================================
    // EXISTING USER
    // ================================================

    if (identity) {

      return this.generateTokens(
        identity.userId,
      );
    }

    // ================================================
    // CREATE USER
    // ================================================

    const username =
      `google_${Date.now()}`;

    const user =
      await this.users.createUser({

        username,

        displayName:
          data.displayName,

        avatar:
          data.avatar,

        isVerified:
          true,

        onboardingCompleted:
          false,
      });

    // ================================================
    // CREATE IDENTITY
    // ================================================

    identity =
      await this.identityRepo.save({

        userId:
          user.id,

        provider:
          AuthProvider.GOOGLE,

        providerUserId:
          data.providerUserId,

        email:
          data.email,

        isVerified:
          true,
      });

    // ================================================
    // ISSUE TOKENS
    // ================================================

    return this.generateTokens(
      user.id,
    );
  }

  // =====================================================
  // GET SESSIONS
  // =====================================================

  async getSessions(
    userId: string,
  ) {

    return this.sessionRepo.find({

      where: {
        userId,
      },

      order: {
        createdAt:
          'DESC',
      },
    });
  }

  // =====================================================
  // REVOKE SESSION
  // =====================================================

  async revokeSession(
    userId: string,
    sessionId: string,
  ) {

    const session =
      await this.sessionRepo.findOne({
        where: {

          userId,

          sessionId,
        },
      });

    if (!session) {

      throw new UnauthorizedException(
        'Session not found',
      );
    }

    session.revoked = true;

    await this.sessionRepo.save(
      session,
    );

    return true;
  }
}