import { Module } from '@nestjs/common';
import { TypeOrmModule }from '@nestjs/typeorm';
import { JwtModule }from '@nestjs/jwt';
import { AuthService }from './auth.service';
import { AuthResolver }from './auth.resolver';
import { AuthProducer }from './auth.producer'; 
import { AuthIdentityEntity }from './entities/auth-identity.entity';
import { AuthSessionEntity }from './entities/auth-session.entity';
import { UserModule }from '../user/user.module';
import { RedisModule }from '../../infrastructure/redis/redis.module';
import { KafkaModule }from '../../infrastructure/kafka/kafka.module';
import { JwtStrategy } from './strategies/apple.strategy';
import { RedisOtpService } from '../../infrastructure/redis/otp/redis.otp.service';
import { RedisAuthRateLimitService } from '../../infrastructure/redis/auth/redis.auth-rate-limit.service';


@Module({
  imports: [
    // DATABASE
    TypeOrmModule.forFeature([
      AuthIdentityEntity,
      AuthSessionEntity,
    ]),
    // JWT
    JwtModule.register({
      secret:
        process.env.JWT_SECRET,

      signOptions: {
        expiresIn: '15m',
      },
    }),

    // DEPENDENCIES
    UserModule,
    RedisModule,
    KafkaModule,
  ],

  providers: [
    AuthService,
    AuthResolver,
    AuthProducer,
    JwtStrategy,
    RedisOtpService,
    RedisAuthRateLimitService,
  ],

  exports: [
    AuthService,
  ],
})
export class AuthModule {}