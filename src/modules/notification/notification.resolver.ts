import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { NotificationService } from './notification.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver()
export class NotificationResolver {
  constructor(private readonly service: NotificationService) {}

  @Query(() => [String]) // replace with model later
  @UseGuards(GqlAuthGuard)
  getNotifications(@CurrentUser() user: any) {
    return this.service.getUserNotifications(user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  markNotificationRead(@Args('id') id: string) {
    return this.service.markAsRead(id);
  }
}