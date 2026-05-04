import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class FeedItem {
  @Field() postId!: string;
  @Field() authorId!: string;
  @Field() createdAt!: Date;
  @Field({ nullable: true }) content?: string;
}

@ObjectType()
export class FeedResponse {
  @Field(() => [FeedItem])
  data!: FeedItem[];

  @Field({ nullable: true })
  nextCursor?: Date;
}