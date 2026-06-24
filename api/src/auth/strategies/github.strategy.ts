import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { OAuthProvider } from '../../users/user.schema';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private config: ConfigService,
    private usersService: UsersService,
    
  ) {
    super({
      clientID: config.get('GITHUB_CLIENT_ID'),
      clientSecret: config.get('GITHUB_CLIENT_SECRET'),
      callbackURL: config.get('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
    
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    const { id, displayName, username, emails, photos } = profile;
    const email = emails?.[0]?.value || `${username}@github.local`;
    const user = await this.usersService.findOrCreate({
      provider: OAuthProvider.GITHUB,
      providerId: String(id),
      name: displayName || username,
      email,
      avatar: photos?.[0]?.value,
    });
    done(null, user);
  }

}
