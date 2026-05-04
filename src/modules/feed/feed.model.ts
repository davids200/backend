import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class FeedItem {
  @Field()
user_id!: string;

  @Field()
  post_id!: string;

  @Field()
  author_id!: string;

  @Field({ nullable: true })
  location_id?: string;

  @Field()
  created_at!: Date;
}