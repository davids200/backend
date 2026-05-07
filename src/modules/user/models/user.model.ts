 import {
  Field,
  ObjectType,
} from '@nestjs/graphql';

@ObjectType()
export class UserModel {

  @Field()
  id?: string;

  @Field()
  username?: string;

  @Field({
    nullable: true,
  })
  displayName?: string;

  @Field({
    nullable: true,
  })
  avatar?: string;

  @Field({
    nullable: true,
  })
  bio?: string;

  @Field({
    nullable: true,
  })
  locationId?: string;

  @Field()
  isVerified!: boolean;

  @Field()
  onboardingCompleted!: boolean;


   @Field()
  isCelebrity!: boolean;
}

 