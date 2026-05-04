import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength } from 'class-validator';


@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  username!: string;

   @Field()
  @IsString()
  @MinLength(6)
  password!: string;

  @Field({ nullable: true })
  countryId?: string;

  @Field({ nullable: true })
  dateOfBirth?: string;
}