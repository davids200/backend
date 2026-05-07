import {
  Field,
  ObjectType,
} from '@nestjs/graphql';

import { UserModel }
from '../../user/models/user.model';

@ObjectType()
export class AuthResponse {

  @Field()
  accessToken!: string;

  @Field()
  refreshToken!: string;

  @Field(() => UserModel)
  user!: UserModel;
}