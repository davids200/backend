import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ReplyCommentInput {
  @Field()
  postId!: string;

  @Field()
  parentId!: string;

  @Field()
  content!: string;
}