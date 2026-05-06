import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class FeedItemModel {
  @Field(() => ID)
  id!: string;

  @Field()
  content!: string;

  @Field()
  authorId!: string;

  @Field()
  createdAt!: Date;

  @Field(() => Int)
  likes!: number;

  @Field(() => Int)
  comments!: number;
}