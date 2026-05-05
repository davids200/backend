import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreateLocationInput {
  @Field()
  name!: string;

  @Field()
  countryId!: string;

  @Field({ nullable: true })
  parentId?: string;

  @Field(() => Float, { nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  longitude?: number;
}