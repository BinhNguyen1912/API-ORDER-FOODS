import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common'
import { CreateDiscountDto } from './dto/create-discount.dto'
import { UpdateDiscountDto } from './dto/update-discount.dto'
import { randomBytes } from 'crypto'
import { baseRepository } from 'src/base.repository'
import { Discount } from './Schema/discount.schema'
import { InjectModel } from '@nestjs/mongoose'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { Types } from 'mongoose'
import { messageRespone } from 'src/common/Message'
import { type_Discount } from './Schema/types'
import QRCode from 'qrcode'
import { Response } from 'express'
import { Payload } from 'src/auth/auth.interface'
import { Order } from 'src/orders/Schema/order.schema'
import { Cron } from '@nestjs/schedule'
@Injectable()
export class DiscountService extends baseRepository<Discount> {
  constructor(@InjectModel(Discount.name) private DiscountModule: SoftDeleteModel<Discount>) {
    super(DiscountModule)
  }
  generateCode(length: number = 4) {
    return `ABN-${randomBytes(length).toString('hex').toUpperCase().slice(0, length)}`
  }
  async create(createDiscountDto: CreateDiscountDto) {
    const { DateDiscount, typeDiscount, DiscountValue, maxDiscount } = createDiscountDto
    if (typeDiscount == type_Discount.percentage) {
      if (DiscountValue <= 0 || DiscountValue > 100) {
        throw new HttpException('DiscountValue must be 0 < value <= 100', HttpStatus.UNPROCESSABLE_ENTITY)
      }
    } else if (typeDiscount == type_Discount.fixed) {
      if (DiscountValue > maxDiscount) {
        throw new HttpException('DiscountValue must be smaller than maxDiscount', HttpStatus.UNPROCESSABLE_ENTITY)
      }
    }
    const code = this.generateCode(5)
    const timeNow = new Date()

    const resuft = await this.DiscountModule.create({
      _id: new Types.ObjectId(),
      ...createDiscountDto,
      startDate: timeNow,
      endDate: new Date(timeNow.getTime() + 24 * 1000 * 60 * 60 * DateDiscount),
      code,
      isActive: true,
      usedCode: 0
    })
    return resuft
  }
  async generateQrCode(id: string, res: Response) {
    const discount = await this.DiscountModule.findById(new Types.ObjectId(id))
    try {
      const data = discount.code.toString()
      const qr = await QRCode.toDataURL(data)
      res.send(`
        <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Qr code</title>
          </head>
          <body>
            <img src="${qr}" alt="Qr Code">
            <p>Scan to Qr get Code Discount</p>
          </body>
          </html>
        `)
    } catch (error) {
      throw new Error(error)
    }
  }

  findAll() {
    return `This action returns all discount`
  }

  findOne(id: string) {
    return `This action returns a #${id} discount`
  }
  async processVoucher(code: string, user: Payload, order: any) {
    try {
      console.log(order)

      const discount = await this.DiscountModule.findOne({ code })
      const TimeNow = new Date()
      //xu ly truong hop het han su dung
      console.log(discount)
      if (!discount) throw new HttpException(messageRespone.NOT_FOUND_DISCOUNT, HttpStatus.NOT_FOUND)

      if (
        !discount.isActive ||
        Number(discount.endDate) - TimeNow.getTime() < 0 ||
        discount.usedCode > discount.useLimit
      ) {
        throw new HttpException(messageRespone.DISCOUNT_EXPIRED, HttpStatus.UNAUTHORIZED)
      }
      //xu ly truong hop kh nam trong danh sach duoc giam
      if (discount.ListUser && discount.ListUser.length > 0) {
        const checkUser = discount.ListUser.find((item) => item == user.user_id)
        if (!checkUser) throw new UnauthorizedException(messageRespone.USER_NOT_SPORT_DISCOUNT)
      }
      //Xu ly truong hop don hang du so tien toi thieu
      if (discount.minOrder && discount.minOrder > order.totalPrice)
        throw new HttpException(`Order value not reached ${discount.minOrder}`, HttpStatus.UNAUTHORIZED)

      //Xu ly truong hop useCode > uselimit
      console.log(discount.usedCode)
      console.log(discount.useLimit)

      if (discount.usedCode >= discount.useLimit) {
        await this.DiscountModule.deleteOne({
          code
        })
        throw new HttpException(messageRespone.COUPON_CODE_HAS_EXPIREDEXPIRED, HttpStatus.ACCEPTED)
      }
      order.discountAmount = discount.DiscountValue
      if (discount.typeDiscount == type_Discount.fixed) {
        order.discountAmount = discount.maxDiscount
      } else if (discount.typeDiscount == type_Discount.percentage) {
        order.discountAmount = order.totalPrice * (order.discountAmount * 0.1)
      }
      order.finalPrice = order.totalPrice - order.discountAmount
      discount.usedCode++
      console.log('ORDER AFTER HANDEL DISCOUNT')
      console.log(order)

      await discount.save()
      return order
    } catch (err) {
      throw new UnauthorizedException(err.message)
    }
  }

  async update(id: string, updateDiscountDto: UpdateDiscountDto) {
    //DateDiscount la so ngay voucher duoc su dung
    const { DateDiscount } = updateDiscountDto
    const discount = await this.DiscountModule.findById(new Types.ObjectId(id))
    if (!discount) {
      throw new HttpException(messageRespone.NOT_FOUND_DISCOUNT, HttpStatus.NOT_FOUND)
    }
    //neu co cap nhat lai so ngay sd voucher -> cap nhat lai ngay ket thuc
    let endDate
    if (DateDiscount) {
      const startDate = discount.startDate
      endDate = new Date(new Date(startDate).getTime() + 24 * 60 * 60 * 1000 * DateDiscount)
    }
    return await this.DiscountModule.updateOne(
      { _id: new Types.ObjectId(id) },
      {
        $set: {
          ...updateDiscountDto,
          endDate: endDate ? endDate : discount.endDate
        }
      },
      {
        returnDocument: 'after'
      }
    )
  }
  async HandlePriceAfterDiscount(code: string, price: number) {
    console.log('handle discount', code)

    const discount = await this.DiscountModule.findOne({ code })
    const TimeNow = new Date()
    //xu ly truong hop het han su dung
    console.log(discount)
    if (!discount) throw new HttpException(messageRespone.NOT_FOUND_DISCOUNT, HttpStatus.NOT_FOUND)
    if (
      !discount.isActive ||
      Number(discount.endDate) - TimeNow.getTime() < 0 ||
      discount.usedCode > discount.useLimit
    ) {
      throw new HttpException(messageRespone.DISCOUNT_EXPIRED, HttpStatus.UNAUTHORIZED)
    }
    //Xu ly truong hop don hang du so tien toi thieu
    if (discount.minOrder && discount.minOrder > price)
      throw new HttpException(`Order value not reached ${discount.minOrder}`, HttpStatus.UNAUTHORIZED)

    //Xu ly truong hop useCode > uselimit
    console.log(discount.usedCode)
    console.log(discount.useLimit)

    if (discount.usedCode >= discount.useLimit) {
      await this.DiscountModule.deleteOne({
        code
      })
      throw new HttpException(messageRespone.COUPON_CODE_HAS_EXPIREDEXPIRED, HttpStatus.ACCEPTED)
    }
    let PriceDiscount
    if (discount.typeDiscount == type_Discount.fixed) {
      PriceDiscount = discount.maxDiscount
    } else if (discount.typeDiscount == type_Discount.percentage) {
      PriceDiscount = price * (discount.DiscountValue * 0.1)
    }
    return PriceDiscount
  }

  remove(id: number) {
    return `This action removes a #${id} discount`
  }
  @Cron('0 0 * * * *')
  async ClearDiscount() {
    const Discount = await this.DiscountModule.find({})
    const timeNow = new Date()
    Discount.map((item) => {
      if (item.endDate.getTime() - timeNow.getTime() < 0) {
      }
    })
  }
}
