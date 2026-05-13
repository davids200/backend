import {  InputType,  Field,registerEnumType,} from '@nestjs/graphql';
import {  IsString,  IsOptional,  MaxLength,  IsArray,} from 'class-validator';
import {  PostVisibility,} from '../enums/post-visibility.enum';

// =====================================================
// REGISTER ENUM
// =====================================================

registerEnumType(PostVisibility,{name: 'PostVisibility',
  },
);

@InputType()
export class CreatePostInput {

@Field({nullable: true,})
@IsString()
locationId!: string;
 
@Field()
@IsString()
@MaxLength(2000)
content?: string;


@Field(() => PostVisibility, {  nullable: true,})
visibility?: PostVisibility;


@Field(() => [String], {    nullable: true,  })
@IsOptional()
@IsArray()
media?: string[];



@Field(() => [String], {    nullable: true,  })
@IsOptional()
@IsArray()
mediaIds?: string[];


@Field(() => [String], {    nullable: true,  })
@IsOptional()
@IsArray()
mentions?: string[];
}