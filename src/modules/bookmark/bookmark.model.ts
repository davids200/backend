import {
  ObjectType,
  Field,
} from '@nestjs/graphql';

@ObjectType()
export class BookmarkModel {

  @Field()
  id!:string;

  @Field()
  userId!:string;

  @Field()
  postId!:string;

  @Field()
  createdAt!:Date;
}