import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AppJwtService } from './app-jwt.service';

import { jwtConstants } from './jwt.config';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity'; 

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
     JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: '15m',
      },
    }),
    TypeOrmModule.forFeature([UserEntity]),  
  ],
  providers: [
    AuthResolver,
    AuthService,
    JwtStrategy,
    AppJwtService,
  ],
})
export class AuthModule {}