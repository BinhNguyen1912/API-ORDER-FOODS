import { Module } from '@nestjs/common'
import { PermissionService } from './permission.service'
import { PermissionController } from './permission.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Permission, PermissonSchema } from './Schema/permission.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Permission.name, schema: PermissonSchema, collection: Permission.name }])
  ],
  controllers: [PermissionController],
  providers: [PermissionService]
})
export class PermissionModule {}
