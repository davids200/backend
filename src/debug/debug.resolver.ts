import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class DebugResolver {
  @Query(() => String)
  ping(): string {
    return 'pong';
  }
}