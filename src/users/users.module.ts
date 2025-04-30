import { forwardRef, Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { users, usersSchema } from './Schema/user.schema'
import { ConfigService } from '@nestjs/config'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  imports: [MongooseModule.forFeature([{ name: users.name, schema: usersSchema }]), forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
