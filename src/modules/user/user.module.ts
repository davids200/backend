import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';
import { UserProfileEntity } from './entities/user-profile.entity';
import { UserEducationEntity } from './entities/user-education.entity';
import { UserSessionEntity } from './entities/user-session.entity';

import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { KafkaModule } from '../../infrastructure/kafka/kafka.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserProfileEntity,
      UserEducationEntity,
      UserSessionEntity,
    ]),
    KafkaModule,
  ],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}