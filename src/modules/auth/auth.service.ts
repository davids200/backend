import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { AppJwtService } from './app-jwt.service';
import { UserEntity } from '../user/entities/user.entity';
import { UserMapper } from '../user/user.mapper';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: AppJwtService,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  // 🔐 REGISTER
  async register(email: string, password: string, username: string,locationId:string) {
    const existing = await this.userRepository.findOne({
      where: { email },
    });

    if (existing) {
      throw new UnauthorizedException('User already exists');
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      username,
      password: hashed,
      locationId
    });

    const savedUser = await this.userRepository.save(user);

    return this.generateTokens(savedUser);
  }

  // 🔐 LOGIN
  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  // 🔁 REFRESH TOKEN
  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);

      const user = await this.userRepository.findOne({
        where: { id: payload.userId },
      });

      if (!user || user.refreshToken !== token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Token expired or invalid');
    }
  }

  // 💾 SAVE REFRESH TOKEN
  async saveRefreshToken(userId: string, token: string) {
    await this.userRepository.update(
      { id: userId },
      { refreshToken: token },
    );
  }

  // 🎟 TOKEN GENERATION
  private async generateTokens(user: UserEntity) {
    const payload = {
      userId: user.id,
      email: user.email,
      locationId:user.locationId
    };

    const accessToken =
      this.jwtService.generateAccessToken(payload);

    const refreshToken =
      this.jwtService.generateRefreshToken(payload);

    // ✅ persist refresh token
    await this.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: UserMapper.toDto(user),
      location:location
    };
  }
}