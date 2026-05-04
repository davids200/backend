import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { LocationService } from './location.service';
import { CreateLocationInput } from './dto/create-location.input';
import { LocationModel } from './location.model';

@Resolver(() => LocationModel)
export class LocationResolver {
  constructor(private readonly service: LocationService) {}

  // =========================
  // CREATE LOCATION
  // =========================
  @Mutation(() => LocationModel)
  async createLocation(
    @Args('data') data: CreateLocationInput,
  ) {
    return this.service.createLocation(data);
  }

  // =========================
  // GET SINGLE LOCATION
  // =========================
  @Query(() => LocationModel, { nullable: true })
  async getLocation(@Args('id') id: string) {
    return this.service.getLocation(id);
  }

  // =========================
  // GET CHILDREN
  // =========================
  @Query(() => [LocationModel])
  async getLocationChildren(@Args('parentId') parentId: string) {
    return this.service.getChildren(parentId);
  }

  // =========================
  // GET TREE
  // =========================
  @Query(() => LocationModel, { nullable: true })
  async getLocationTree(@Args('id') id: string) {
    return this.service.getLocationTree(id);
  }
}