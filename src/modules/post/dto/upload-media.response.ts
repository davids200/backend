import {
  ObjectType,
  Field,
} from '@nestjs/graphql';

@ObjectType()
export class UploadMediaResponse {

  @Field()
  mediaId!: string;

  @Field()
  url!: string;
}