import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './jwt.config';

@Injectable()
export class AppJwtService {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(payload: Record<string, unknown>): string {
    return this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: jwtConstants.accessExpiresIn,
    });
  }

  generateRefreshToken(payload: Record<string, unknown>): string {
    return this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: jwtConstants.refreshExpiresIn,
    });
  }

 verify(token: string): any {
  return this.jwtService.verify(token, {
    secret: jwtConstants.secret,
  });
}
}