import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

import {  InjectRepository,} from '@nestjs/typeorm';
import {  Repository,} from 'typeorm';
import {  JwtService,} from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import {  AuthIdentityEntity,  AuthProvider,} from './entities/auth-identity.entity';
import { AuthSessionEntity }from './entities/auth-session.entity';import { UserService }from '../user/user.service';
import { LoginInput }from './dto/login.input';
import { RegisterInput }from './dto/register.input';
import { JwtPayload }from './interfaces/jwt-payload.interface';
import { hashPassword }from './utils/hash-password.util';
import { verifyPassword }from './utils/verify-password.util';
import { generateOtp }from './utils/generate-otp.util';
import { RedisOtpService }from '../../infrastructure/redis/otp/redis.otp.service';
import { AuthProducer }from './auth.producer';
import { RedisAuthRateLimitService }from '../../infrastructure/redis/auth/redis.auth-rate-limit.service';

@Injectable()
export class AuthService {

  constructor(

    @InjectRepository(
      AuthIdentityEntity,
    )
    private readonly identityRepo:
      Repository<AuthIdentityEntity>,
      private readonly authRateLimit:
  RedisAuthRateLimitService,

    @InjectRepository(
      AuthSessionEntity,
    )
    private readonly sessionRepo:
      Repository<AuthSessionEntity>,

    private readonly users:
      UserService,

    private readonly jwt:
      JwtService,

    private readonly redisOtp:
      RedisOtpService,

    private readonly authProducer:
      AuthProducer,
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
    // EMAIL IDENTITY
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
    // PHONE IDENTITY
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

  async login(data: LoginInput,) {

const attempts =await this.authRateLimit.getLoginAttempts(data.login,);
if (attempts >= 5) {
throw new UnauthorizedException(
'Too many login attempts',
);
}



    const identity =
      await this.identityRepo.findOne({
        where: [

          {
            provider:
              AuthProvider.EMAIL,

            providerUserId:
              data.login,
          },

          {
            provider:
              AuthProvider.PHONE,

            providerUserId:
              data.login,
          },
        ],
      });

    if (!identity || !identity.passwordHash    ) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

const valid =
await verifyPassword(
identity.passwordHash,
data.password,
);

if (!valid) {
await this.authRateLimit.incrementLoginAttempts(data.login,);
throw new UnauthorizedException('Invalid credentials',);
}
await this.authRateLimit.clearLoginAttempts(data.login,);
return this.generateTokens(identity.userId,);
}

  // =====================================================
  // GENERATE TOKENS
  // =====================================================

  async generateTokens(
    userId: string,
  ) {

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
            process.env.JWT_REFRESH_SECRET,

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
    // STORE SESSION
    // ================================================

    await this.sessionRepo.save({

      sessionId,

      userId,

      refreshTokenHash,

      revoked:
        false,
    });

    // ================================================
    // FETCH USER
    // ================================================

    const user =
      await this.users.getUser(
        userId,
      );

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
  // GET CURRENT USER
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
    // FIND SESSIONS
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

    const session =
      await this.sessionRepo.findOne({
        where: {
          sessionId,
        },
      });

    if (!session) {
      return true;
    }

    session.revoked = true;

    await this.sessionRepo.save(
      session,
    );

    return true;
  }

  // =====================================================
  // SEND OTP
  // =====================================================

async sendOtp(data: {type: 'email' | 'phone'; value: string;}) {
const requests =  await this.authRateLimit.getOtpRequests(data.value,);

if (requests >= Number(process.env.OTP_ATTEMPTS)) {
throw new BadRequestException('Too many OTP requests',);
}

await this.authRateLimit.incrementOtpRequests(data.value,);

// GENERATE OTP
const otp = generateOtp();
// STORE OTP
await this.redisOtp.saveOtp({type:data.type,value:data.value,otp,});

// EMIT EVENT
await this.authProducer.otpRequested({type:data.type,value:data.value,});
  
// TEMP LOG
console.log(`OTP for ${data.value}: ${otp}`,);
return true;
}

 
// VERIFY OTP
async verifyOtp(data: {type: 'email' | 'phone'; value: string; otp: string;}) { 
const attempts = await this.redisOtp.getAttempts({type:data.type,value:data.value,});

if (attempts >= Number(process.env.MAXIMUM_LOGIN_ATTEMPT)) {
throw new UnauthorizedException('Too many attempts',);
} 
// GET STORED OTP 
const storedOtp =await this.redisOtp.getOtp({type:data.type,value:data.value,});

// INVALID OTP
if (!storedOtp || storedOtp !== data.otp) {
await this.redisOtp.incrementAttempts({type:data.type,value:data.value,});
throw new UnauthorizedException('Invalid OTP',);
}
    
// FIND IDENTITY 
const identity =await this.identityRepo.findOne({where: [{provider:data.type === 'email'? AuthProvider.EMAIL: AuthProvider.PHONE,
providerUserId:data.value,},],});
// MARK VERIFIED
if (identity) {
identity.isVerified =true;
await this.identityRepo.save(identity,);
}

// CLEANUP
await this.redisOtp.deleteOtp({type:data.type,value:data.value,});
await this.redisOtp.clearAttempts({type:data.type,value:data.value,});

return true;
}




async requestPasswordReset(data: {
  type: 'email' | 'phone';
  value: string;
}) {

  // ================================================
  // CHECK USER EXISTS
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

  // ================================================
  // SILENT FAIL
  // ================================================

  if (!identity) {

    return true;
  }

  // ================================================
  // REUSE OTP SYSTEM
  // ================================================

  await this.sendOtp({
    type:
      data.type,

    value:
      data.value,
  });

  return true;
}


async resetPassword(data: {
  type: 'email' | 'phone';
  value: string;
  otp: string;
  newPassword: string;
}) {

  // VERIFY OTP
  const storedOtp =
    await this.redisOtp.getOtp({type:data.type,value:data.value,});

  if (!storedOtp || storedOtp !== data.otp) {
    throw new UnauthorizedException(
      'Invalid OTP',
    );
  }

  // FIND IDENTITY
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

  
  // HASH NEW PASSWORD
  identity.passwordHash =await hashPassword(data.newPassword,);
  await this.identityRepo.save(identity,);

  // ================================================
  // DELETE OTP
  // ================================================

  await this.redisOtp.deleteOtp({type:data.type,value:data.value,});
  
  // REVOKE OLD SESSIONS
  await this.sessionRepo.update({ userId:identity.userId,}, {
      revoked: true,    },
  );

  return true;
}

}