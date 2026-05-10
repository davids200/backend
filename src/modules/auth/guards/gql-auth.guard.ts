import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import * as jwt from 'jsonwebtoken';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtPayload } from '../types/jwt-payload.type';
import { SessionCacheService } from '../services/session-cache.service';

@Injectable()

export class GqlAuthGuard
  implements CanActivate
{
  constructor(

    private readonly sessionCache:
      SessionCacheService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ) {

    // ============================================
    // GRAPHQL CONTEXT
    // ============================================

    const gqlContext =
      GqlExecutionContext.create(
        context,
      );

    const req =
      gqlContext
        .getContext()
        .req;

    // ============================================
    // AUTH HEADER
    // ============================================

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {

      throw new UnauthorizedException(
        'Missing token',
      );
    }

    // ============================================
    // TOKEN
    // ============================================

    const token =
      authHeader.replace(
        'Bearer ',
        '',
      );

    try {

      // ==========================================
      // VERIFY JWT
      // ==========================================

      const payload =
        jwt.verify(

          token,

          process.env.JWT_SECRET!,
        ) as JwtPayload;

      // ==========================================
      // CHECK REDIS SESSION
      // ==========================================

      const exists =
        await this.sessionCache
          .hasSession(
            payload.sessionId,
          );

      if (!exists) {

        throw new UnauthorizedException(
          'Session expired',
        );
      }

      // ==========================================
      // ATTACH USER
      // ==========================================

      req.user = {

        id:
          payload.sub,

        sessionId:
          payload.sessionId,
      };

      return true;

    } catch {

      throw new UnauthorizedException(
        'Invalid token',
      );
    }
  }
}