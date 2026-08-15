import { Module } from '@nestjs/common';
import { UsersService } from './service';
import { UsersController } from './controller';
import { AdminUsersController } from './admin.controller';
import { UsersRepository } from './repository';

@Module({
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
