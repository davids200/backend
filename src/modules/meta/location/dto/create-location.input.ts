import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateLocationInput {
  @Field()
  name!: string;

  @Field()
  type!: string;

  @Field({ nullable: true })
  parentId?: string;

  @Field({ nullable: true })
  countryCode?: string;
}