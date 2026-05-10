export interface SuspiciousLoginEvent {

  userId: string;

  sessionId: string;

  ip?: string;

  country?: string;

  city?: string;

  browser?: string;

  platform?: string;

  device?: string;

  createdAt?: string;
}