import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common'
import { PermissionService } from './permission.service'
import { CreatePermissionDto } from './dto/create-permission.dto'
import { UpdatePermissionDto } from './dto/update-permission.dto'
import { CheckID } from 'src/Core/Guard'
import { messageRespone } from 'src/common/Message'
import { MESSAGES } from '@nestjs/core/constants'
import { ResponeMessage } from 'src/Decorators/Customs'

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return await this.permissionService.create(createPermissionDto)
  }

  @Get('GetAllPermission')
  @ResponeMessage(messageRespone.GET_LIST_SUCCESS)
  async findAll(@Query() query: string, @Query('limit') limit: number, @Query('page') page: number) {
    return await this.permissionService.GetList(query, limit, page)
  }

  @Get(':id')
  @ResponeMessage(messageRespone.GET_SUCCESS)
  @UseGuards(CheckID)
  async findOne(@Param('id') id: string) {
    return await this.permissionService.findOne(id)
  }

  @Patch(':id')
  @UseGuards(CheckID)
  @ResponeMessage(messageRespone.UPDATE_SUCCESS)
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionService.update(id, updatePermissionDto)
  }

  @Delete(':id')
  @ResponeMessage(messageRespone.DELETE_SUCCESS)
  @UseGuards(CheckID)
  async remove(@Param('id') id: string) {
    return await this.permissionService.remove(id)
  }
}
