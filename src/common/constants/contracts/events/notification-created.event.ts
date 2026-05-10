export interface NotificationCreatedEvent {

  userId: string;

  actorId?: string;

  type: string;

  referenceId?: string;

  createdAt: string;
}