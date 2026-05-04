import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { EducationLevelService } from "./education-level.service";

@Resolver()
export class EducationLevelResolver {
  constructor(private service: EducationLevelService) {}

  @Mutation(() => String)
  createEducationLevel(
    @Args('name') name: string,
    @Args('order') order: number,
  ) {
    return this.service.create(name, order);
  }

  @Query(() => [String])
  educationLevels() {
    return this.service.findAll();
  }
}