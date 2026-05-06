import { Field, Int, ObjectType } from "@nestjs/graphql";
import { FeedItem } from "./get-feed.input";

 

@ObjectType()
export class FeedResponse {
  @Field(() => [FeedItem])
  data!: FeedItem[];

  @Field(() => Int, { nullable: true })
  nextCursor?: number;
}