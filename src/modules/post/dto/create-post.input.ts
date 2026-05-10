import {  InputType,  Field,} from '@nestjs/graphql';
import {  IsString,  IsOptional,  MaxLength,  IsArray,} from 'class-validator';

@InputType()
export class CreatePostInput {

@Field({nullable: true,})
@IsString()
locationId!: string;
 
@Field()
@IsString()
@MaxLength(2000)
content?: string;


@Field({    nullable: true,  })
@IsOptional()
@IsString()
visibility?:    'public'    | 'followers'    | 'private'    | 'local';


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