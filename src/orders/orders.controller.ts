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
  Req,
  Res,
  HttpException,
  HttpStatus
} from '@nestjs/common'
import { OrdersService } from './orders.service'
import { CreateOrderHereDto, CreateOrderOnlineDto } from './dto/create-order.dto'
import { DecodeToken, ResponeMessage } from 'src/Decorators/Customs'
import { messageRespone } from 'src/common/Message'
import { CheckID } from 'src/Core/Guard'
import { Payload } from 'src/auth/auth.interface'
import { status_Order } from './Schema/order.interface'
import { MESSAGES } from '@nestjs/core/constants'
import { Request, Response } from 'express'

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('getAll')
  async findAll(@Query() query: string, @Query('page') page: number, @Query('limit') limit: number) {
    return await this.ordersService.findAll(query, limit, page)
  }

  @UseGuards(CheckID)
  @ResponeMessage(messageRespone.UPDATE_SUCCESS)
  @Patch('updateStatus/:id')
  async updateStatus(@Body('status') newStatus: status_Order, @Param('id') id: string) {
    return await this.ordersService.updateStatus(newStatus, id)
  }

  @UseGuards(CheckID)
  @Get(':id')
  @ResponeMessage(messageRespone.GET_SUCCESS)
  async findOne(@Param('id') id: string) {
    return await this.ordersService.findOne(id)
  }

  @Post('online')
  @ResponeMessage(messageRespone.CREATE_SUCCESS)
  async orderOnline(
    @Body() createOrderOnlineDto: CreateOrderOnlineDto,
    @DecodeToken() user: Payload,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const resuft = await this.ordersService.OrderOnine(createOrderOnlineDto, user, req, res)
    res.json(resuft)
  }

  @Delete(':id')
  @ResponeMessage(messageRespone.DELETE_SUCCESS)
  async remove(@Param('id') id: string, @DecodeToken() user: Payload, @Body('CancellReason') cancellReason: string) {
    return await this.ordersService.remove(id, cancellReason)
  }

  @Get('GetOrderHistory/myOrder')
  @ResponeMessage(messageRespone.GET_LIST_SUCCESS)
  async GetOrderHistory(@DecodeToken() user: Payload, @Query('limit') limit: number, @Query('page') page: number) {
    return await this.ordersService.getOrderHistory(user, limit, page)
  }

  @Get('getData/exportOrdersToCSV')
  async exportOrdersToCSV() {
    return await this.ordersService.exportDataOrderToCVS()
  }
}
