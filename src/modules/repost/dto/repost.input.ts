// src/modules/repost/dto/repost.input.ts

import {
  Field,
  InputType,
} from '@nestjs/graphql';

@InputType()
export class RepostInput
{
  @Field()
  postId!: string;

  @Field({
    nullable: true,
  })
  quote?: string;
}