import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class LocationModel {
  @Field(() => ID)
  id!: string;

  
  @Field()
  name!: string;

  @Field()
  countryId!: string;

  @Field({ nullable: true })
  parentId?: string;

  @Field(() => Int)
  level!: number;

  @Field(() => Float, { nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  longitude?: number;

  @Field(() => [LocationModel], { nullable: true })
  children?: LocationModel[];
}