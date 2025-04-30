import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { RoleService } from './role.service'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { ResponeMessage } from 'src/Decorators/Customs'
import { messageRespone } from 'src/common/Message'

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    // return await this.roleService.getPermissionForRole()
    return await this.roleService.create(createRoleDto)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.roleService.findOne(id)
  }

  @Get('roleDetail/:id')
  async getRoleDetail(@Param('id') id: string) {
    return await this.roleService.getRoleDetail(id)
  }

  @Delete(':id/permissionId/:permissionId')
  @ResponeMessage(messageRespone.DELETE_SUCCESS)
  async remove(@Param('id') id: string, @Param('permissionId') permissionId: string) {
    return await this.roleService.remove(id, permissionId)
  }
}
