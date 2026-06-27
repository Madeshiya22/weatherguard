import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../users/user.schema';

// Function: AdminGuard (CanActivate Guard)
// Kya kar raha hai: Role-Based Access Control (RBAC) implement karta hai. Check karta hai ki request me aane wala user 'admin' hai ya nahi. Agar 'admin' nahi hai toh 403 Forbidden error fek deta hai.
// Relation / Architecture: UsersController (findPending, approve, reject) aur AlertsController (triggerManual) par lagaya gaya hai taaki koi normal user admin routes hit na kar sake. Frontend mein iske parallel 'AdminRoute.tsx' component kaam karta hai.
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
