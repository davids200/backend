import {
  Field,
  InputType,
} from '@nestjs/graphql';

@InputType()
export class ResetPasswordInput {

  @Field()
  type!: 'email' | 'phone';

  @Field()
  value!: string;

  @Field()
  otp!: string;

  @Field()
  newPassword!: string;
}