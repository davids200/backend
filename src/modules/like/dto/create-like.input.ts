import { Field,  InputType,} from '@nestjs/graphql';

@InputType()
export class CreateLikeInput {

  @Field()
  targetId!: string;

  @Field()
  targetType!:'post' | 'comment';
}