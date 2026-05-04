import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { SchoolService } from "./school.service";

@Resolver()
export class SchoolResolver {
  constructor(private service: SchoolService) {}

  @Mutation(() => String)
  createSchool(
    @Args('name') name: string,
    @Args('locationId') locationId: string,
  ) {
    return this.service.create(name, locationId);
  }

  @Query(() => [String])
  schools(@Args('locationId') locationId: string) {
    return this.service.findByLocation(locationId);
  }
}