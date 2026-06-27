import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './user.schema';
import { TelegramModule } from '../telegram/telegram.module';

// Function: UsersModule
// Kya kar raha hai: Yeh NestJS ka feature module hai jo Users se related sabhi chizon
//  (database models, controllers, services) ko ek jagah bundle karta hai (Encapsulation).
@Module({
  imports: [
    // MongooseModule.forFeature: MongoDB mein 'users' collection ka schema register karta hai taaki UsersService mein
    //  @InjectModel(User.name) use kiya ja sake.
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    
    // TelegramModule: Isko import karne se UsersController ke andar TelegramService accessible ho jata hai 
    // (jisse approval ke waqt notification bheja jata hai).
    TelegramModule,
  ],
  // providers: UsersService ko NestJS ke Dependency Injection (DI) container mein register karta hai taaki
  //  Controller iske functions use kar sake.
  providers: [UsersService],
  
  // controllers: /api/users ke saare REST API endpoints ko handle karne ke liye UsersController ko register karta hai.
  controllers: [UsersController],
  
  // exports: UsersService ko export karta hai taaki baaki modules (jaise AuthModule aur AlertsModule) UsersModule 
  // ko import karke UsersService (findOrCreate, findApprovedWithTelegram) ko access kar sakein.
  exports: [UsersService],
})
export class UsersModule {}
