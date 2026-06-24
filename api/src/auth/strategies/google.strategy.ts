import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { OAuthProvider } from '../../users/user.schema';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private config: ConfigService,
    private usersService: UsersService,
  ) {
    console.log(
      'GOOGLE CALLBACK URL:',
      config.get('GOOGLE_CALLBACK_URL'),
    );
    console.log('CLIENT ID:', config.get('GOOGLE_CLIENT_ID'));
    console.log('CLIENT SECRET EXISTS:', !!config.get('GOOGLE_CLIENT_SECRET'));
    console.log('CALLBACK URL:', config.get('GOOGLE_CALLBACK_URL'));

    super({
      clientID: config.get('GOOGLE_CLIENT_ID'),
      clientSecret: config.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { id, displayName, emails, photos } = profile;
    const user = await this.usersService.findOrCreate({
      provider: OAuthProvider.GOOGLE,
      providerId: id,
      name: displayName,
      email: emails[0].value,
      avatar: photos?.[0]?.value,
    });
    done(null, user);
  }
}
