import {
  Field,
  InputType,
} from '@nestjs/graphql';

@InputType()
export class SendOtpInput {

  @Field()
  type!: 'email' | 'phone';

  @Field()
  value!: string;
}