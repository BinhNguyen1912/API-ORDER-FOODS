import { HttpCode, HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Role } from './Schema/role.schema'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { isValidObjectId, Types } from 'mongoose'
import { Permission } from 'src/permission/Schema/permission.schema'
import { messageRespone } from 'src/common/Message'

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private RoleModule: SoftDeleteModel<Role>,
    @InjectModel(Permission.name) private permisisonModule: SoftDeleteModel<Permission>
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    const { name, permissions } = createRoleDto
    //Kiem tra Role nay da ton tai chua , neu co thi chi viec them vao , con khong thi tao moi
    const checkExits = await this.RoleModule.findOne({ name })
    if (checkExits) {
      permissions.map((item) => {
        if (checkExits.permissions.find((v) => v == item)) return
        checkExits.permissions.push(new Types.ObjectId(item))
      })
      return await checkExits.save()
    }
    return await this.RoleModule.create({
      ...createRoleDto,
      permissions: permissions.map((item) => new Types.ObjectId(item))
    })
  }

  async findOne(id: string) {
    const resuft = await this.RoleModule.findById(id).populate({ path: 'permissions', select: 'path method isActive' })
    return resuft
  }

  async getRoleDetail(id: string) {
    const roleDetail = (await this.RoleModule.findById(id)).populate({
      path: 'permissions',
      select: 'name path method isActive'
    })
    return roleDetail
  }

  async remove(id: string, permissionId: string) {
    if (!isValidObjectId(id) || !isValidObjectId(permissionId))
      throw new HttpException(messageRespone.Id_not_format, HttpStatus.UNAUTHORIZED)
    return await this.RoleModule.updateOne(
      { _id: new Types.ObjectId(id) },
      {
        $pull: {
          permissions: new Types.ObjectId(permissionId)
        }
      },
      {
        returnDocument: 'after'
      }
    )
  }
  async getPermissionForRole() {
    const permissions = await this.permisisonModule.find({})
    const permissionIds = permissions.map((item) => new Types.ObjectId(item._id))
    return await this.RoleModule.deleteMany({
      name: 'USER_ROLE'
    })
  }
}
