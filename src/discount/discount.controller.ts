import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res } from '@nestjs/common'
import { DiscountService } from './discount.service'
import { CreateDiscountDto } from './dto/create-discount.dto'
import { UpdateDiscountDto } from './dto/update-discount.dto'
import { Public, ResponeMessage } from 'src/Decorators/Customs'
import { messageRespone } from 'src/common/Message'
import { CheckID } from 'src/Core/Guard'
import { Response } from 'express'
import QRCode from 'qrcode'

@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  @ResponeMessage(messageRespone.CREATE_SUCCESS)
  async create(@Body() createDiscountDto: CreateDiscountDto) {
    return await this.discountService.create(createDiscountDto)
  }

  @Public()
  @Get('generateQrCode/:id')
  async generateQrCode(@Param('id') id: string, @Res() res: Response) {
    return await this.discountService.generateQrCode(id, res)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discountService.findOne(id)
  }
  //coi thu duoc giam nhieu tien
  @Post('getPriceDiscount')
  async HandlePriceAfterDiscount(@Body() body: { code: string; price: number }): Promise<number> {
    return await this.discountService.HandlePriceAfterDiscount(body.code, body.price)
  }

  @Patch(':id')
  @UseGuards(CheckID)
  @ResponeMessage(messageRespone.UPDATE_SUCCESS)
  async update(@Param('id') id: string, @Body() updateDiscountDto: UpdateDiscountDto) {
    return await this.discountService.update(id, updateDiscountDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discountService.remove(+id)
  }
}
