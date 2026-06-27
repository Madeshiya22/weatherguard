import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Function: JwtAuthGuard
// Kya kar raha hai: NestJS/Passport ka 'jwt' strategy trigger karta hai. Yeh check karta hai ki incoming API request me 'Authorization: Bearer <token>' header me valid JWT token hai ya nahi.
// Relation / Architecture: Backend ke protected controllers (UsersController, AlertsController) par lagaya jata hai. Frontend ke 'client.ts' axios instance se token is guard tak pahonchta hai.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
