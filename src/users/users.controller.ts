import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { CheckID } from 'src/Core/Guard'
import { DecodeToken, ResponeMessage } from 'src/Decorators/Customs'
import { Payload } from 'src/auth/auth.interface'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(CheckID)
  @ResponeMessage('Get Success')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id)
  }

  @UseGuards(CheckID)
  @ResponeMessage('Update Success')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto)
  }

  @UseGuards(CheckID)
  @ResponeMessage('Delete Success')
  @Delete(':id')
  remove(@Param('id') id: string, @DecodeToken() user: Payload) {
    return this.usersService.remove(id, user)
  }

  @Post('getListUser')
  @ResponeMessage('Get Success')
  async getListUser(@Query() query: string, @Query('limit') limit: number, @Query('page') page: number) {
    return await this.usersService.GetList(query, limit, page)
  }

  //dùng cho veryfy user bằng token
  @Get('getUser/byToken')
  @ResponeMessage('Get Success')
  async getUserByUserName(@DecodeToken() token: Payload) {
    return await this.usersService.getUserByToken(token)
  }
}
