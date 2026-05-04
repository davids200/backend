import { Resolver, Mutation, Args } from '@nestjs/graphql';

import { AuthService } from './auth.service';
import { AuthPayload } from './models/auth.model';

import { LoginInput } from './inputs/login.input';
import { RegisterInput } from './inputs/register.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async register(
    @Args('input') input: RegisterInput,
  ): Promise<AuthPayload> {
    return this.authService.register(
      input.email,
      input.password,
      input.username,
      input.locationId
    );
  }

  @Mutation(() => AuthPayload)
async refreshToken(
  @Args('token') token: string,
): Promise<AuthPayload> {
  return this.authService.refreshToken(token);
}

  @Mutation(() => AuthPayload)
  async login(
    @Args('input') input: LoginInput,
  ): Promise<AuthPayload> {
    return this.authService.login(input.email, input.password);
  }
}