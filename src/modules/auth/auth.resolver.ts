import {
  Resolver,
  Mutation,
  Args,
} from '@nestjs/graphql';
import { AuthService }from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthResponse }from './models/auth-response.model';

import {  Query,} from '@nestjs/graphql';
import {  UseGuards,} from '@nestjs/common';
import { GqlAuthGuard }from './guards/gql-auth.guard';
import { CurrentUser }from './decorators/current-user.decorator';
import { UserModel }from '../user/models/user.model';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { SendOtpInput } from './dto/send-otp.input';
import { VerifyOtpInput } from './dto/verify-otp.input';
import { RequestPasswordResetInput } from './dto/request-password-reset.input';
import { ResetPasswordInput } from './dto/reset-password.input';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly auth:
      AuthService,
  ) {}

  // =====================================================
  // REGISTER
  // =====================================================
  @Mutation(() => Boolean)
@UseGuards(GqlAuthGuard)
async logout(  @CurrentUser() user: any,) {
  return this.auth.logout( user.sessionId, );
}


@Mutation(() => AuthResponse)
async refreshToken(  @Args('data')  data: RefreshTokenInput,) {
  return this.auth.refreshToken(    data.refreshToken,  );
}


  @Mutation(() => AuthResponse)
  async register(    @Args('data')    data: RegisterInput,  ) {
    return this.auth.register(      data,    );
  }



@Mutation(() => Boolean)
async requestPasswordReset(@Args('data')data: RequestPasswordResetInput,) {
return this.auth.requestPasswordReset(data,);
}

@Mutation(() => Boolean)
async resetPassword(@Args('data') data: ResetPasswordInput,) {
return this.auth.resetPassword(data,);
}


   
  // LOGIN 
@Mutation(() => AuthResponse)
async login(@Args('data') data: LoginInput,) {
  return this.auth.login(data,);
}


  @Mutation(() => Boolean)
async sendOtp(
  @Args('data')
  data: SendOtpInput,
) {

  return this.auth.sendOtp(
    data,
  );
}

@Mutation(() => Boolean)
async verifyOtp(
  @Args('data')
  data: VerifyOtpInput,
) {

  return this.auth.verifyOtp(
    data,
  );
}

@Query(() => UserModel)
@UseGuards(GqlAuthGuard)
async me(
  @CurrentUser()
  user: any,
) {

  return this.auth.getMe(
    user.id,
  );
}






}