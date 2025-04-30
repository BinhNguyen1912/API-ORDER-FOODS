import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreatePermissionDto } from './dto/create-permission.dto'
import { UpdatePermissionDto } from './dto/update-permission.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Permission } from './Schema/permission.schema'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { baseRepository } from 'src/base.repository'
import { Types } from 'mongoose'
@Injectable()
export class PermissionService extends baseRepository<Permission> {
  constructor(@InjectModel(Permission.name) private PermissionModule: SoftDeleteModel<Permission>) {
    super(PermissionModule)
  }
  async create(createPermissionDto: CreatePermissionDto) {
    const { method, path } = createPermissionDto
    return await this.PermissionModule.findOneAndUpdate(
      {
        method,
        path
      },
      {
        $set: {
          ...createPermissionDto
        }
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
  }

  findAll() {
    return `This action returns all permission`
  }

  async findOne(id: string) {
    return await this.PermissionModule.findById(id)
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    return await this.PermissionModule.updateOne(
      { _id: id },
      {
        ...updatePermissionDto
      },
      {
        returnDocument: 'after'
      }
    )
  }

  async remove(id: string) {
    return await this.PermissionModule.softDelete({ _id: new Types.ObjectId(id) })
  }
}
