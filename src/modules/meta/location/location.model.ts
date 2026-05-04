import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class LocationModel {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  type!: string;

  // Match your DB column names OR map consistently
  @Field({ nullable: true })
  parent_id?: string;

  @Field({ nullable: true })
  country_code?: string;

  // for tree queries
  @Field(() => [LocationModel], { nullable: true })
  children?: LocationModel[];
}