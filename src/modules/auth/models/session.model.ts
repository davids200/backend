import {
  Field,
  ObjectType,
} from '@nestjs/graphql';

@ObjectType()
export class SessionModel {

  @Field()
  sessionId!: string;

  @Field({nullable: true,})
  deviceName?: string;

  @Field({nullable: true,})
  platform?: string;

  @Field({nullable: true,})
  browser?: string;

  @Field({nullable: true,})
  ipAddress?: string;

  @Field({nullable: true,})
  country?: string;

  @Field({nullable: true,})
  city?: string;

  @Field()
  revoked!: boolean;

  @Field()
  suspicious!: boolean;

  @Field({nullable: true,})
  lastActiveAt?: Date;

  @Field()
  createdAt!: Date;
}