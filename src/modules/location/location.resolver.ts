import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { LocationService } from './location.service';
import { LocationEntity } from './location.entity';
import { CreateLocationInput } from './dto/create-location.input'; // You'll need to create this DTO

@Resolver(() => LocationEntity)
export class LocationResolver {
  constructor(private readonly locationService: LocationService) {}

  // =========================
  // MUTATIONS
  // =========================
  @Mutation(() => LocationEntity)
  async createLocation(
    @Args('data') data: CreateLocationInput,
  ): Promise<LocationEntity> {
    return this.locationService.createLocation(data);
  }

  // =========================
  // QUERIES
  // =========================

  // Get a single location by ID
 @Query(() => LocationEntity, { name: 'location', nullable: true })
async getLocation(@Args('id') id: string): Promise<LocationEntity | null> {
  // Use the repository directly or via a service method
  return this.locationService['locationRepo'].findOne({ where: { id } });
}

  // Get the full hierarchy tree starting from a root ID
  @Query(() => LocationEntity, { name: 'locationTree' })
  async getLocationTree(@Args('id') id: string) {
    return this.locationService.getLocationTree(id);
  }

  // =========================
  // FIELD RESOLVERS
  // =========================
  /**
   * These resolve nested relations. 
   * GraphQL will only run these if the user includes 'children' or 'parent' in their query.
   */

  @ResolveField(() => [LocationEntity])
  async children(@Parent() location: LocationEntity): Promise<LocationEntity[]> {
    const { id } = location;
    // For 1B scale, consider using a DataLoader here to avoid N+1 issues
    return this.locationService['locationRepo'].find({ where: { parentId: id } });
  }

  @ResolveField(() => LocationEntity, { nullable: true })
  async parent(@Parent() location: LocationEntity): Promise<LocationEntity | null> {
    const { parentId } = location;
    if (!parentId) return null;
    return this.locationService['locationRepo'].findOne({ where: { id: parentId } });
  }
}