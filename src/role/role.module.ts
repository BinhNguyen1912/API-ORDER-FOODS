import { Module } from '@nestjs/common'
import { RoleService } from './role.service'
import { RoleController } from './role.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Role, RoleSchema } from './Schema/role.schema'
import { Permission, PermissonSchema } from 'src/permission/Schema/permission.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema, collection: Role.name },
      { name: Permission.name, schema: PermissonSchema, collection: Permission.name }
    ])
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService]
})
export class RoleModule {}
