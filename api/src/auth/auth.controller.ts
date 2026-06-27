import { Controller, Get, UseGuards, Request, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {   
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  // Function: googleLogin
  // Kya kar raha hai: Google OAuth login flow initiate karta hai.
  // Relation / Component: Frontend ke 'LoginPage.tsx' aur 'RequestAccessPage.tsx' mein 'Continue with Google' button click karne par yahan request aati hai (window.location.href = '/api/auth/google').
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  // Function: googleCallback
  // Kya kar raha hai: Google login verify hone ke baad Google is URL par profile data bhejta hai. Yeh JWT token generate karta hai aur frontend par redirect karta hai.
  // Relation / Component: Frontend ke 'CallbackPage.tsx' (/auth/callback?token=...) par redirect karta hai jahan token localStorage mein save hota hai.
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Request() req, @Res() res: Response) {
    const token = this.authService.generateToken(req.user);
    const frontendUrl = this.config.get('FRONTEND_URL');
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  // Function: githubLogin
  // Kya kar raha hai: GitHub OAuth login flow initiate karta hai.
  // Relation / Component: Frontend ke 'LoginPage.tsx' aur 'RequestAccessPage.tsx' mein 'Continue with GitHub' button click karne par yahan request aati hai.
  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubLogin() {}

  // Function: githubCallback
  // Kya kar raha hai: GitHub login verify hone ke baad profile data leta hai, JWT token banata hai aur frontend callback par bhejta hai.
  // Relation / Component: Frontend ke 'CallbackPage.tsx' par token bhejta hai jiske baad user '/dashboard' par redirect hota hai.
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  githubCallback(@Request() req, @Res() res: Response) {
    const token = this.authService.generateToken(req.user);
    const frontendUrl = this.config.get('FRONTEND_URL');
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
}

