import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UserResponseDto {
  @Field()
  id!: string;

  @Field()
  email!: string;

  @Field()
  username!: string;

  @Field({ nullable: true })
  location_id?: string;
}