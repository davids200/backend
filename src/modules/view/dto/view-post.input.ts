import { InputType,Field,Int,Float } from '@nestjs/graphql';

@InputType()
export class MediaViewInput {

  @Field()
  mediaId!:string;

  @Field(() => Int)
  watchTimeMs!:number;

  @Field(() => Float)
  completionRate!:number;
}

@InputType()
export class ViewPostInput {

  @Field()
  postId!:string;

  @Field(() => Int)
  dwellTimeMs!:number;

  @Field(() => [MediaViewInput],{
    nullable:true,
  })
  media?:MediaViewInput[];
}