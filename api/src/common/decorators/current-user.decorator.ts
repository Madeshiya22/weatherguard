import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Function: CurrentUser (Custom Param Decorator)
// Kya kar raha hai: Express request object se 'req.user' ko extract karke controller methods me directly inject karta hai.
// Relation / Backend: Yeh ek clean helper decorator hai taaki @Request() req likhne ki jagah directly @CurrentUser() user likha ja sake.
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
