import {
  Field,
  InputType,
} from '@nestjs/graphql';

@InputType()
export class RequestPasswordResetInput {

  @Field()
  type!: 'email' | 'phone';

  @Field()
  value!: string;
}