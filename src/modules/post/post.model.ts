import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class PostModel {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field({ nullable: true })
  content?: string;

  @Field(() => [String], { nullable: true })
  mediaUrls?: string[];

  @Field()
  createdAt!: Date;
}