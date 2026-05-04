import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { CountryService } from './country.service';
import { CountryModel } from './country.model';

@Resolver()
export class CountryResolver {
  constructor(private service: CountryService) {}

@Mutation(() => CountryModel)
createCountry(
  @Args('name') name: string,
  @Args('code') code: string,
) {
  return this.service.create(name, code);
}



 @Query(() => [CountryModel])
countries() {
  return this.service.findAll();
}
}