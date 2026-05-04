import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, MaxLength, IsArray } from 'class-validator';

@InputType()
export class CreatePostInput {
  @Field()
  @IsString()
  locationId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  media?: string[];
}