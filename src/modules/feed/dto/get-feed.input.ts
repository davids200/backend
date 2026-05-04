import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class FeedItem {
  @Field()
  postId!: string;

  @Field()
  authorId!: string;

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  content?: string;

  @Field(() => [String], { nullable: true })
  media?: string[];
}