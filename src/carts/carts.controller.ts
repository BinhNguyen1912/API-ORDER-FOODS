import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  Req
} from '@nestjs/common'
import { CartsService } from './carts.service'
import { CreateCartDto } from './dto/create-cart.dto'
import { DecodeToken, Public, ResponeMessage } from 'src/Decorators/Customs'
import { Payload } from 'src/auth/auth.interface'
import { CheckID } from 'src/Core/Guard'
import { messageRespone } from 'src/common/Message'
import { Request } from 'express'
@Controller('online/carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @ResponeMessage(messageRespone.ADD_TO_CART_SUCCESS)
  async create(@Body() createCartDto: CreateCartDto, @DecodeToken() user: Payload) {
    console.log(createCartDto)
    return await this.cartsService.create(createCartDto, user)
  }

  @Get()
  async findAll(@Query() query: string, @Query('limit') limit: number, @Query('page') page: number) {
    return await this.cartsService.findAll(query, limit, page)
  }

  @Get(':customer_id')
  async findOne(@Param('customer_id') customer_id: string) {
    return await this.cartsService.findOne(customer_id)
  }

  @Get('/ByCartId/:cart_id')
  async findOneByCartID(@Param('cart_id') cart_id: string) {
    return await this.cartsService.GetCartByCartId(cart_id)
  }

  @Patch(':customer_id/foodID/:foodID')
  async update(@Param() params, @Body('quality') quality: number) {
    const { customer_id, foodID } = params
    return await this.cartsService.update(customer_id, quality, foodID)
  }

  @Delete(':customer_id')
  async remove(@Param() params, @Req() req: Request) {
    const { customer_id } = params
    const { headers } = req
    console.log(headers)

    const foodIDs = JSON.parse(headers['food-ids'] as string)
    console.log(foodIDs)

    return await this.cartsService.remove(customer_id, foodIDs)
  }
}
