import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { OrderFoodHistoryService } from './order-food-history.service'
import { CreateOrderFoodHistoryDto } from './dto/create-order-food-history.dto'
import { UpdateOrderFoodHistoryDto } from './dto/update-order-food-history.dto'
import { DecodeToken } from 'src/Decorators/Customs'
import { Payload } from 'src/auth/auth.interface'

@Controller('order-food-history')
export class OrderFoodHistoryController {
  constructor(private readonly orderFoodHistoryService: OrderFoodHistoryService) {}

  // @Post()
  // create(@Body() createOrderFoodHistoryDto: CreateOrderFoodHistoryDto) {
  //   return this.orderFoodHistoryService.create(createOrderFoodHistoryDto);
  // }

  // @Get()
  // findAll() {
  //   return this.orderFoodHistoryService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.orderFoodHistoryService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderFoodHistoryDto: UpdateOrderFoodHistoryDto) {
  //   return this.orderFoodHistoryService.update(+id, updateOrderFoodHistoryDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.orderFoodHistoryService.remove(+id);
  // }

  @Get('myOrder')
  async getOrderFoodHistory(
    @DecodeToken() user: Payload,
    @Query('limit') limit: number = 10,
    @Query('page') page: number = 1
  ) {
    return await this.orderFoodHistoryService.getOrderFoodHistory(user.user_id.toString(), Number(limit), Number(page))
  }
}
