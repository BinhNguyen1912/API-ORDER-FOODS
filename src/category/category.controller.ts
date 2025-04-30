import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common'
import { CategoryService } from './category.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { DecodeToken, Public, ResponeMessage } from 'src/Decorators/Customs'
import { messageRespone } from 'src/common/Message'
import { CheckID } from 'src/Core/Guard'
import { Payload } from 'src/auth/auth.interface'

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    console.log(createCategoryDto)
    return await this.categoryService.create(createCategoryDto)
  }

  @Public()
  @Get('GetListCategory/list')
  @ResponeMessage(messageRespone.GET_LIST_SUCCESS)
  async findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return await this.categoryService.findAll(limit, page)
  }

  @Get(':id')
  @Public()
  @UseGuards(CheckID)
  @ResponeMessage(messageRespone.GET_SUCCESS)
  async findOne(@Param('id') id: string) {
    return await this.categoryService.findOne(id)
  }

  @Patch(':id')
  @ResponeMessage(messageRespone.UPDATE_SUCCESS)
  @UseGuards(CheckID)
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto)
  }

  @Delete(':id')
  @UseGuards(CheckID)
  async remove(@Param('id') id: string, @DecodeToken() user: Payload) {
    return await this.categoryService.remove(id, user)
  }
}
