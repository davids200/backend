import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class AddEducationInput {
  @Field()
  schoolName!: string;

  @Field()
  educationLevelId!: string;

  @Field({ nullable: true })
  startDate?: string;

  @Field({ nullable: true })
  endDate?: string;
}