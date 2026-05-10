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
import { GoogleStrategy } from './strategies/google.strategy';
import { AuthController } from './auth.controller';
import { AuthSecurityService } from './security/auth-security.service';
import { DeviceService } from './device/device.service'; 
import { SmsGatewayService } from '../notification/channels/sms/sms-gateway.service';
import { TwilioProvider } from '../notification/channels/sms/providers/twilio.provider';
import { CustomSmsProvider } from '../notification/channels/sms/providers/custom-sms.provider';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // DATABASE
    TypeOrmModule.forFeature([
      AuthIdentityEntity,
      AuthSessionEntity,
    ]),
    // JWT
    JwtModule.registerAsync({

  inject: [ConfigService],

  useFactory: (
    config: ConfigService,
  ) => ({

    secret:
      config.get<string>(
        'JWT_SECRET',
      ),

    signOptions: {
      expiresIn: '1d',
    },
  }),
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
    GoogleStrategy,
    AuthSecurityService,
    DeviceService,
  SmsGatewayService,
TwilioProvider,
CustomSmsProvider,
  ],
  controllers: [
  AuthController,
],

  exports: [
    AuthService,
  ],
})
export class AuthModule {}