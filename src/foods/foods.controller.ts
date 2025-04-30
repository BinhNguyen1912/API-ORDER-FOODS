import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Res } from '@nestjs/common'
import { FoodsService } from './foods.service'
import { CreateFoodDto } from './dto/create-food.dto'
import { UpdateFoodDto } from './dto/update-food.dto'
import { DecodeToken, IS_PUBLIC, Public, ResponeMessage } from 'src/Decorators/Customs'
import { Payload } from 'src/auth/auth.interface'
import { CheckID } from 'src/Core/Guard'
import { messageRespone } from 'src/common/Message'
import SchemaPagination from 'src/common/SchemaPagination'

@Controller('foods')
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Post()
  @ResponeMessage(messageRespone.CREATE_SUCCESS)
  async create(@Body() createFoodDto: CreateFoodDto, @DecodeToken() user: Payload) {
    return await this.foodsService.create(createFoodDto, user)
  }

  @UseGuards(CheckID)
  @Public()
  @ResponeMessage(messageRespone.GET_SUCCESS)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.foodsService.findOne(id)
  }

  @UseGuards(CheckID)
  @ResponeMessage(messageRespone.UPDATE_SUCCESS)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFoodDto: UpdateFoodDto, @DecodeToken() user: Payload) {
    return await this.foodsService.update(id, updateFoodDto, user)
  }

  @UseGuards(CheckID)
  @ResponeMessage(messageRespone.DELETE_SUCCESS)
  @Delete(':id')
  async remove(@Param('id') id: string, @DecodeToken() user: Payload) {
    return await this.foodsService.remove(id, user)
  }

  @Public()
  @Get('GetListFoods/list')
  @ResponeMessage(messageRespone.GET_SUCCESS)
  async GetList(@Query('limit') limit: number, @Query('page') page: number, @Query() query: string) {
    console.log('query', query)
    console.log('page', page)
    console.log('limit', limit)

    return await this.foodsService.GetListFoods(query, page, limit)
  }

  @Public()
  @Get('FindFoodByName/list')
  @ResponeMessage('Get Success')
  async FindFoodByName(@Query('limit') limit: number, @Query('page') page: number, @Query('query') query: string) {
    const decodedQuery = decodeURIComponent(query)
    return await this.foodsService.FindFoodByName(limit, page, decodedQuery)
  }

  @Public()
  @Post('FindFoodByCategory')
  @ResponeMessage('Get Success')
  async FindFoodByCategory(@Query('limit') limit: number, @Query('page') page: number, @Query('id') id: string) {
    return await this.foodsService.FindFoodByCategory(limit, page, id)
  }
}
