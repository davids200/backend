import * as jwt from 'jsonwebtoken';

export function generateAccessToken(userId: string,sessionId: string,) {

  return jwt.sign({sub: userId,sessionId,},
    process.env.JWT_SECRET!,    {
      expiresIn: '15m',
    },
  );
}