import {
  Field,
  InputType,
} from '@nestjs/graphql';

@InputType()
export class VerifyOtpInput {

  @Field()
  type!: 'email' | 'phone';

  @Field()
  value!: string;

  @Field()
  otp!: string;
}