
export const jwtConstants = {
  secret: 'super_secret_key',

  accessExpiresIn: '15m' as const,
  refreshExpiresIn: '7d' as const,
};