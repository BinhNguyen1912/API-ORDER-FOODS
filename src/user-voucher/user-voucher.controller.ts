import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { UserVoucherService } from './user-voucher.service'
import { CreateUserVoucherDto } from './dto/create-user-voucher.dto'
import { UpdateUserVoucherDto } from './dto/update-user-voucher.dto'

@Controller('user-voucher')
export class UserVoucherController {
  constructor(private readonly userVoucherService: UserVoucherService) {}

  @Post()
  create(@Body() createUserVoucherDto: CreateUserVoucherDto) {
    return this.userVoucherService.create(createUserVoucherDto)
  }

  @Get()
  findAll() {
    return this.userVoucherService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userVoucherService.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserVoucherDto: UpdateUserVoucherDto) {
    return this.userVoucherService.update(+id, updateUserVoucherDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userVoucherService.remove(+id)
  }
}
