import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { UserService } from './user.service';
import { UpdateProfileInput } from './dto/update-profile.input';
import { AddEducationInput } from './dto/add-education.input';

import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateUserInput } from './dto/create-user.inputs';

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
  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  addEducation(
    @CurrentUser() user: any,
    @Args('data') data: AddEducationInput,
  ) {
   return this.service.addEducation(user.id, {
  ...data,
  startDate: data.startDate
    ? new Date(data.startDate)
    : undefined,
  endDate: data.endDate
    ? new Date(data.endDate)
    : undefined,
});
  }

  @Query(() => String)
  @UseGuards(GqlAuthGuard)
  getEducation(@CurrentUser() user: any) {
    return this.service.getEducation(user.id);
  }
}