import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../users/user.schema';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // Function: generateToken
  // Kya kar raha hai: Logged-in user ke ID, email, aur role ko lekar ek secure JWT (JSON Web Token) sign karta hai.
  // Relation / Component: Yeh 'AuthController' (googleCallback & githubCallback) se call hota hai. Frontend is token ko localStorage mein store karta hai aur har API request ke header (Authorization: Bearer <token>) mein attach karta hai.
  generateToken(user: UserDocument): string {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
}

