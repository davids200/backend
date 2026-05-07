import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { UserService } from './user.service';
import { UpdateProfileInput } from './dto/update-profile.input'; 
 
import { CreateUserInput } from './dto/create-user.inputs';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver()
export class UserResolver {
  constructor(private readonly service: UserService) {}

  // =========================
  // CREATE
  // =========================
  @Mutation(() => String)
async createUser(@Args('data') data: CreateUserInput) {
  return this.service.createUser({
    ...data,
    dateOfBirth: data.dateOfBirth
      ? new Date(data.dateOfBirth)
      : undefined,
  });
}

  // =========================
  // GET USER
  // =========================
  @Query(() => String)
  getUser(@Args('id') id: string) {
    return this.service.getUser(id);
  }

  // =========================
  // PROFILE
  // =========================
  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  updateProfile(
    @CurrentUser() user: any,
    @Args('data') data: UpdateProfileInput,
  ) {
    return this.service.updateProfile(user.id, data);
  }

  @Query(() => String)
  @UseGuards(GqlAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return this.service.getProfile(user.id);
  }

  // =========================
  // EDUCATION
  // =========================
 
 
}