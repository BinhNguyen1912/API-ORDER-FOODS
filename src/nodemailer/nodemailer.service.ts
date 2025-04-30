import { forwardRef, HttpException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { CreateNodemailerDto } from './dto/create-nodemailer.dto'
import { UpdateNodemailerDto } from './dto/update-nodemailer.dto'
import { MailerService } from '@nestjs-modules/mailer'
import { OrdersService } from 'src/orders/orders.service'
import { Payload } from 'src/auth/auth.interface'
import { CreatePaymentDto } from 'src/payment/dto/create-payment.dto'
import { users } from 'src/users/Schema/user.schema'

@Injectable()
export class NodemailerService {
  constructor(
    private mailService: MailerService,
    @Inject(forwardRef(() => OrdersService))
    private readonly orderService: OrdersService
  ) {}
  async sendMailToOrder(order_id: string, status: string) {
    try {
      const order: any = await this.orderService.findOne(order_id)
      const { id_customer, _id, cart_id, discountAmount, finalPrice, totalPrice } = order
      const { foods } = cart_id
      const foodItem = []
      foods.map((item) => {
        foodItem.push({
          _id: item.foodID._id,
          name: item.foodID.name,
          price: this.orderService.formatVND(item.foodID.price),
          quality: item.quality,
          total: this.orderService.formatVND(item.foodID.price * item.quality)
        })
      })
      return this.mailService.sendMail({
        to: id_customer.email,
        template: 'Order',
        subject: 'Xác nhận đơn hàng',
        context: {
          name: id_customer.name,
          phone: id_customer.phone,
          email: id_customer.email,
          address: order.address,
          orderId: _id,
          time: order.createdAt.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
          paymentMethod: order.paymentMethod,
          foodItem: foodItem,
          discountAmount: this.orderService.formatVND(discountAmount),
          finalPrice: this.orderService.formatVND(finalPrice),
          totalPrice: this.orderService.formatVND(totalPrice),
          status
        }
      })
    } catch (err) {
      throw new UnauthorizedException(err.message)
    }
  }
  async sendToCodeForAuthen(user: users, code: string) {
    try {
      // console.log(token)

      return await this.mailService.sendMail({
        to: user.email,
        template: 'sendCode',
        subject: 'No Reply , Authentication',
        context: {
          name: user.name,
          code
        }
      })
    } catch (err) {
      throw new UnauthorizedException(err.message)
    }
  }
  create(createNodemailerDto: CreateNodemailerDto) {
    return 'This action adds a new nodemailer'
  }

  findAll() {
    return `This action returns all nodemailer`
  }

  findOne(id: number) {
    return `This action returns a #${id} nodemailer`
  }

  update(id: number, updateNodemailerDto: UpdateNodemailerDto) {
    return `This action updates a #${id} nodemailer`
  }

  remove(id: number) {
    return `This action removes a #${id} nodemailer`
  }
}
