import {  Injectable,} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {  Strategy,  Profile,} from 'passport-google-oauth20';
import { ConfigService }from '@nestjs/config';

@Injectable()
export class GoogleStrategy  extends PassportStrategy(    Strategy,    'google',  ){
  constructor(    private readonly config:      ConfigService,  ) {

    super({
      clientID:config.get<string>('GOOGLE_CLIENT_ID',)!,
      clientSecret:config.get<string>('GOOGLE_CLIENT_SECRET',)!,
      callbackURL:config.get<string>('GOOGLE_CALLBACK_URL',)!,

      scope: ['email','profile',],
    });
  }

  async validate(accessToken: string,refreshToken: string,profile: Profile,) {
    return {
      provider:'google',
      providerUserId:profile.id,
      email:profile.emails?.[0]?.value,
      displayName:profile.displayName,
      avatar:profile.photos?.[0]?.value,
    };
  }
}