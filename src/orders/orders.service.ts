import { BadRequestException, forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { CreateOrderDto, CreateOrderHereDto, CreateOrderOnlineDto } from './dto/create-order.dto'
import { baseRepository } from 'src/base.repository'
import { FoodItem, Order } from './Schema/order.schema'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { payType, status_Order } from './Schema/order.interface'
import { Connection, Types } from 'mongoose'
import { Payload } from 'src/auth/auth.interface'
import { Cart } from 'src/carts/Schema/cart.schema'
import aqp from 'api-query-params'
import e, { Request, Response } from 'express'
import { NodemailerService } from 'src/nodemailer/nodemailer.service'
import { PaymentService } from 'src/payment/payment.service'
import { CartsService } from 'src/carts/carts.service'
import { DiscountService } from 'src/discount/discount.service'
import { messageRespone } from 'src/common/Message'
import * as fs from 'fs'
import * as Papa from 'papaparse'
import { DATAORDER } from 'src/common/FakeData'
import axios from 'axios'
import { create } from 'domain'
//682d64ea9fe9c50bb065ab92
/**
 * CÁC VẤN ĐỀ TRONG VIỆC TẠO ĐƠN HÀNG
 * - Sẽ không cho sửa đơn hàng nếu (đơn hàng đó đã được thanh toán , đơn hàng đó đã được chấp nhận khác pending)
 */
@Injectable()
export class OrdersService extends baseRepository<Order> {
  constructor(
    @InjectModel(Order.name) private orderModule: SoftDeleteModel<Order>,
    @InjectConnection() private connection: Connection,
    @Inject(forwardRef(() => NodemailerService))
    private readonly nodemailerService: NodemailerService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    @Inject(forwardRef(() => CartsService))
    private readonly cartService: CartsService,
    private discountService: DiscountService
  ) {
    super(orderModule)
  }
  formatVND = (amount: number): string => {
    // Sử dụng regex để thêm dấu chấm phân cách hàng nghìn
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  // async checkFraud(orderData): Promise<any> {
  //   try {
  //     console.log('Calling FastAPI...')
  //     const response = await axios.post('http://127.0.0.1:8001/predict', orderData)
  //     return response.data // { fraudulent: true/false }
  //   } catch (error) {
  //     console.error('Error calling FastAPI:', error)
  //     throw new Error('Failed to get prediction from FastAPI')
  //   }
  // }
  async generage() {
    const Data = DATAORDER
    const resuft = await Promise.all(
      Data.map(async (item) => {
        const _id = new Types.ObjectId()
        const resuft = await this.orderModule.create({ ...item, _id })
        return resuft
      })
    )
    console.log(`Created ${resuft.length} Order`)

    return resuft
  }

  //Lấy toàn bộ đơn hàng theo trạng thái đơn hàng
  //ví dụ {{host}}/orders/getAll?limit=4&status=/pending/i&page=1
  isValidDateFormat(dateStr: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(Date.parse(dateStr)) // Kiểm tra YYYY-MM-DD, Kiểm tra cả format lẫn ngày có hợp lệ không
  }

  //LẤY HẾT CÁC ĐƠN HÀNG THEO NGÀY , Tìm các đơn hàng theo trạng thái , và loại bỏ các đơn hàng thanh toán chuyển khoản thất bại
  //-> Mục đích cho nhân viên làm đơn
  async findAll(query: string, limit: number = 10, page: number = 1) {
    try {
      //query ở đây sẽ là lấy các đơn hàng theo trạng thái , hoặc là tất cả các đơn hàng
      const { filter, population, sort, projection } = aqp(query)

      //xóa page và limit , vì nếu không xóa nó sẽ đưua vào điều kiện để find
      delete filter.page
      delete filter.limit

      // Kiểm tra nếu có createdAt và định dạng đúng YYYY-MM-DD
      if (filter.createdAt) {
        let dateStr: string

        if (filter.createdAt instanceof Date) {
          // Nếu là Date object, chuyển về chuỗi ISO
          dateStr = filter.createdAt.toISOString().split('T')[0]
        } else if (typeof filter.createdAt === 'string') {
          // Nếu là string, tách chuỗi
          dateStr = filter.createdAt.split('T')[0]
        } else {
          throw new BadRequestException('createdAt không hợp lệ')
        }

        // Kiểm tra định dạng YYYY-MM-DD
        if (!this.isValidDateFormat(dateStr)) {
          throw new BadRequestException('createdAt phải có định dạng YYYY-MM-DD')
        }

        // Chuyển về khoảng thời gian trong ngày
        const startDate = new Date(dateStr)
        startDate.setHours(0, 0, 0, 0)

        const endDate = new Date(dateStr)
        endDate.setHours(23, 59, 59, 999)

        filter.createdAt = { $gte: startDate, $lte: endDate }
      }

      /**  KỸ NĂNG NÀY HAY
       * Set thêm điều kiện cho chắc chắn
       * 1. Nếu đơn hàng thanh toán bằng tiền mặt -> lấy hết
       * 2. Nếu đơn hàng thanh toán chuyên khoản -> chỉ lấy những đơn hàng đã được thanh toán rồi
       const filter: any = {
      filter.$or = [
        { paymentMethod: { $ne: "transfer" } },
        { paymentMethod: "transfer", isPaid: true }
      ]

       *Không lấy các đơn hàng chuyển khoản thất bại (mã bên dưới)
       */

      //*Không lấy các đơn hàng chuyển khoản thất bại

      //NorIsPaidFalse=1 them query nay de lay het
      if (filter.NorIsPaidFalse) {
        filter.$nor = [
          {
            paymentMethod: payType.vnpay,
            isPaied: false
          }
        ]
        delete filter.NorIsPaidFalse
      }
      console.log('query get all order', query)
      console.log('limit get all order', limit)
      console.log('page get all order', page)
      const [resuft, totalDocument] = await Promise.all([
        this.orderModule
          .find(filter)
          .skip((page - 1) * limit)
          .limit(limit)
          .sort(sort as any)
          .populate([
            {
              path: 'cart_id',
              select:
                '-_id -customer_id -isOrder -isDeleted -deletedAt -createdAt -updatedAt -__v -foods.isDeleted -foods.deletedAt',
              populate: {
                path: 'foods.foodID',
                select: 'name'
              }
            },
            {
              path: 'id_customer',
              select: 'name email phone address'
            }
          ])
          .select('notes status isPaied paymentMethod finalPrice createdAt updatedAt')
          .exec(),
        (await this.orderModule.find(filter)).length
      ])
      return {
        resuft,
        totalPage: Math.ceil(totalDocument / limit) || 0,
        totalDocument: totalDocument || 0,
        limit: Number(limit),
        page: Number(page)
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.UNAUTHORIZED)
    }
  }

  async findOne(id: string) {
    const foods = await this.orderModule
      .findById(id)
      .populate([
        {
          path: 'cart_id', //Tham chiếu tới foodId của từng item trong mảng foods
          select: 'foods -_id',
          populate: {
            path: 'foods.foodID',
            select: 'image price name'
          }
        },
        {
          path: 'id_customer',
          select: 'name email phone address'
        }
      ])
      .exec()
    return foods
  }
  async updateStatus(newStatus: status_Order, id: string) {
    try {
      //check order
      const order: Order = await this.orderModule.findOne({ _id: new Types.ObjectId(id) })
      if (!order) {
        throw new HttpException('Không tìm thấy đơn hàng', HttpStatus.UNAUTHORIZED)
      }
      if (order.status == status_Order.SHIPPING && newStatus != status_Order.SUCCESS) {
        throw new HttpException('Đơn hàng đang giao', HttpStatus.UNAUTHORIZED)
      }
      //xu ly truong hop preparing khong cho doi lai thanh pending
      if (order.status == status_Order.PREPARED && newStatus == status_Order.PENDING) {
        throw new HttpException('Đơn hàng đang chuẩn bị', HttpStatus.UNAUTHORIZED)
      }
      //xu ly don hang da haon thanh nhung bi cancel
      if (
        order.status == status_Order.SUCCESS &&
        (newStatus == status_Order.CANCELED || newStatus == status_Order.PENDING || newStatus == status_Order.PREPARED)
      ) {
        throw new HttpException(
          'Đơn hàng đã hoàn thành không thể không thể chuyển đổi trạng thái',
          HttpStatus.UNAUTHORIZED
        )
      }
      order.status = newStatus
      await order.save()
      return messageRespone.UPDATE_SUCCESS
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST)
    }
  }

  async remove(id: string, cancellReason: string) {
    const order: Order = await this.orderModule.findOne({ _id: new Types.ObjectId(id) })
    if (!order) {
      throw new HttpException('Không tìm thấy đơn hàng', HttpStatus.UNAUTHORIZED)
    }
    if (order.status != status_Order.PENDING) {
      throw new HttpException('Đơn hàng đã được chuẩn bị không thể hủy đơn hàng', HttpStatus.BAD_REQUEST)
    }
    // const timeNow = new Date().getTime()
    //Quá 5 phút sẽ không cho hủy đơn
    // const halfpartMinuteLate = new Date(order.OrderTimePrepare).getTime() + 1000 * 60 * 30 //30 phut
    // if (timeNow > halfpartMinuteLate) {
    //   throw new HttpException('Không thể hủy đơn hàng vì quá thời gian quy định', HttpStatus.UNAUTHORIZED)
    // }
    // if (order.isPaied) {
    //   throw new HttpException('Đơn hàng đã thanh toán', HttpStatus.ACCEPTED)
    // }

    order.status = status_Order.CANCELED
    if (cancellReason) order.cancellReason = cancellReason || ''
    await order.save()
    return await this.orderModule.softDelete({ _id: new Types.ObjectId(id) })
  }
  //Tao moi don hang
  async OrderOnine(createOrderDto: CreateOrderDto, user: Payload, req: Request, res: Response) {
    //Bat dau 1 session  cho transaction (cua mongoose)
    try {
      console.log('hehe')

      const { cart_id, notes, address, paymentMethod, discount_code, phone } = createOrderDto
      let totalPrice = 0
      const cart = await this.cartService.FindByCartID(cart_id.toString())

      if (!cart || cart.isOrder) {
        throw new HttpException('Không tìm thấy giỏ hàng hoặc giỏ hàng đã được xử lý', HttpStatus.UNAUTHORIZED)
      }
      // if (!cart.totalPrice || cart.isModify) {
      // console.log('order_service -- nhay vao de tinh totalprice lai')

      totalPrice = await this.TotalPriceForCartId(cart_id.toString())
      // } else totalPrice = cart.totalPrice
      //Cap nhat lai gio hang

      //khi dung save , mongoose sẽ tự động kiểm tra các trường thay đổi và cập nhật chúng lại , không cần update cho phức tạp

      let order = {
        ...createOrderDto,
        id_customer: new Types.ObjectId(user.user_id),
        cart_id: new Types.ObjectId(cart_id),
        isPaied: false,
        notes: notes ? notes : '',
        address,
        phone,
        totalPrice,
        discountAmount: 0,
        finalPrice: totalPrice,
        OrderTimePrepare: new Date().toISOString()
      }
      //XỬ LÝ TRƯỜNG HỢP NGƯỜI DÙNG DÙNG MÃ GIẢM GIÁ
      if (discount_code) {
        order = await this.discountService.processVoucher(discount_code, user, order)
      }

      // const checkFraud = await this.checkFraud({
      //   discountAmount: order.discountAmount || 0,
      //   finalPrice: order.finalPrice || 0,
      //   totalPrice: order.totalPrice || 0,
      //   isPaied: order.isPaied || 0,
      //   paymentMethod: order.paymentMethod || '',
      //   order_hour: new Date(order.OrderTimePrepare).getHours() || 0,
      //   order_weekday: new Date(order.OrderTimePrepare).getDay() || 0,
      //   is_deleted: 0,
      //   isFinalPriceNegative: order.finalPrice < 0 ? 1 : 0,
      //   status: 'PENDING'
      // })

      // console.log('checkFraudOBJ', checkFraud.response)

      // if (checkFraud.fraudulent) {
      //   throw new HttpException('Đơn hàng đang bị nghi ngờ , không thể tạo đơn hàng', HttpStatus.UNAUTHORIZED)
      // }
      // console.log('checkFraud', checkFraud.response)

      //Tao moi don hang
      const resuft = await this.orderModule.create({ ...order })
      await this.cartService.CheckOutCart(cart_id.toString())
      //Xu ly truong hop neu chuyen khoan vnpay
      // cart.isOrder = true

      if (paymentMethod == payType.vnpay) {
        await this.paymentService.createPaymentUrl(req, resuft, res)
        await Promise.all([this.nodemailerService.sendMailToOrder(resuft._id, 'VNPAY'), cart.save()])
        await cart.save()
        res.json(await Promise.all([this.paymentService.createPaymentUrl(req, resuft, res), cart.save()]))
      } else if (paymentMethod == payType.cash) {
        await Promise.all([this.nodemailerService.sendMailToOrder(resuft._id, 'Thanh toán tiền mặt'), cart.save()])
        res.json({
          message: messageRespone.ORDER_SUCCESS,
          order: {
            _id: resuft._id,
            id_customer: resuft.id_customer,
            address: resuft.address,
            phone: resuft.phone,
            finalPrice: resuft.finalPrice,
            status: status_Order.PENDING,
            paymentMethod: resuft.paymentMethod,
            name: (cart.customer_id as any).name || null,
            email: (cart.customer_id as any).email || null
          }
        })
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.UNAUTHORIZED)
    }
  }

  async TotalPriceForCartId(cart_id: string) {
    const cart = await this.cartService.FindByCartID(cart_id)
    const foods = cart['foods']
    let totalPrice = 0
    // console.log(foods)

    foods.map((item) => {
      totalPrice += item.quality * (item.foodID as any).price
    })
    return totalPrice
  }
  async getOrderHistory(user: Payload, limit: number, page: number) {
    const [resuft, totalDocument] = await Promise.all([
      this.orderModule
        .find({ id_customer: new Types.ObjectId(user.user_id) })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate([
          {
            path: 'cart_id',
            select:
              '-_id -customer_id -isOrder -isDeleted -deletedAt -updatedAt -createdAt -__v -foods.isDeleted -foods.deletedAt',
            populate: { path: 'foods.foodID', select: 'name price' }
          }
        ])
        .select('-id_customer -isDeleted -deletedAt -discount_code  -OrderTimePrepare -__v -transactionId')
        .exec(),
      (
        await this.orderModule.find({
          id_customer: new Types.ObjectId(user.user_id),
          isPaied: true
        })
      ).length
    ])
    return {
      resuft: resuft,
      totalDocument: totalDocument || 0,
      totalPage: Math.ceil(totalDocument / limit),
      page: Number(page),
      limit: Number(limit)
    }
  }
  async exportDataOrderToCVS(): Promise<string> {
    try {
      const orders = await this.orderModule.find().exec()
      if (!orders || orders.length === 0) {
        throw new Error('Không có đơn hàng nào để xuất CSV!')
      }
      const dirPath = 'D:\\DATA_Order_CVS'
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true }) // Tạo thư mục nếu chưa tồn tại
      }

      //lay cac truong quan trong ra de huan luyen
      const processedOrders = orders.map((order) => ({
        totalPrice: order.finalPrice,
        discountAmount: order.discountAmount,
        paymentMethod: order.paymentMethod,
        isPaied: order.isPaied,
        isDeleted: order.isDeleted,
        status: order.status,
        address: order.address,
        phone: order.phone,
        OrderTimePrepare: order.OrderTimePrepare,
        cart_id: order.cart_id,
        id_customer: order.id_customer,
        transactionId: order.transactionId,
        // finalPrice: order.finalPrice,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        deletedAt: order.deletedAt
      }))

      const csv = Papa.unparse(processedOrders)

      const filePath = `D:\\DATA_Order_CVS\\orders_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`

      fs.writeFileSync(filePath, csv)
      return `File đã lưu tại: ${filePath}`
    } catch (error) {
      throw new Error(`Xuất file CSV thất bại: ${error.message}`)
    }
  }
}
