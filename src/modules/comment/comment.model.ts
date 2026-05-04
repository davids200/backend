import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class CommentModel {
  @Field(() => ID)
  id!: string;

  @Field()
  postId!: string;

  @Field()
  userId!: string;

  @Field({ nullable: true })
  parentId?: string;

  @Field()
  rootId!: string;

  @Field()
  content!: string;

  @Field()
  createdAt!: Date;
}