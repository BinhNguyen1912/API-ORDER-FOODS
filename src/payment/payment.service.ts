import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException
} from '@nestjs/common'
import { CreatePaymentDto } from './dto/create-payment.dto'
import { UpdatePaymentDto } from './dto/update-payment.dto'
import { ConfigService } from '@nestjs/config'
import { createHash } from 'crypto'
import { Request, Response } from 'express'
import QueryString from 'qs'
import { queueScheduler } from 'rxjs'
import moment from 'moment'
import crypto from 'crypto'
import * as qs from 'qs'
import * as CryptoJS from 'crypto-js'
import { InjectModel } from '@nestjs/mongoose'
import { Order } from 'src/orders/Schema/order.schema'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { messageRespone } from 'src/common/Message'
import { OrdersService } from 'src/orders/orders.service'
import { TransactionsService } from 'src/transactions/transactions.service'
import { CreateTransactionDto } from 'src/transactions/dto/create-transaction.dto'
import { Types } from 'mongoose'
import { Transaction } from 'src/transactions/schema/transaction.schema'
import { statusTransaction } from './Schema/Interaface'
import { ok } from 'assert'
import axios from 'axios'
import { NodemailerService } from 'src/nodemailer/nodemailer.service'
import { Payload } from 'src/auth/auth.interface'
import { encryptData } from 'src/common/EncodeParams'
// const moment = require("moment")
@Injectable()
export class PaymentService {
  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => OrdersService))
    private orderService: OrdersService,
    private transactionService: TransactionsService,
    @Inject(forwardRef(() => NodemailerService))
    private nodemailerService: NodemailerService
  ) {}
  async createPaymentUrl(req: any, ReqOrderId: any, res: Response) {
    const [order, transaction] = await Promise.all([
      this.orderService.FindOneByID(ReqOrderId._id.toString()),
      await this.transactionService.findOrderIdOfTransaction(ReqOrderId._id.toString())
    ])
    console.log('thanh toasn', order)

    if (transaction && transaction.status == statusTransaction.success) {
      throw new HttpException(messageRespone.PAIED, HttpStatus.OK)
    }
    if (!order) {
      //Truong hop khong tim thay order
      throw new HttpException(messageRespone.ORDER_NOT_FOUND, HttpStatus.NOT_FOUND)
    }
    // //Truong hop don hang da duoc thanh toan
    if (order.isPaied) throw new HttpException(messageRespone.ORDER_WAS_PAIED, HttpStatus.OK)

    const amount = ReqOrderId.finalPrice
    const orderId = this.processOrderId(ReqOrderId._id.toString())

    const date = new Date()
    const createDate = moment(date).format('YYYYMMDDHHmmss')
    const tmnCode = this.configService.get<string>('tmnCode').trim()
    const secretKey = this.configService.get<string>('secretKey').trim()
    const vnpUrl = this.configService.get<string>('vnpUrl')
    const returnUrl = this.configService.get<string>('vnp_ReturnUrl')
    const vnp_IpnUrl = this.configService.get<string>('vnp_IpnUrl')
    const ipAddr = this.getClientIp(req)
    console.log('IpnUrl', vnp_IpnUrl)

    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Amount: amount * 100,
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Ma giao dich ${orderId}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_Locale: 'vn',
      vnp_CreateDate: createDate
    }

    const sortedParams = this.sortObject(vnp_Params)
    const signData = qs.stringify(sortedParams, { encode: false })
    const hmac = crypto.createHmac('sha512', secretKey)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
    sortedParams['vnp_SecureHash'] = signed

    const paymentUrl = `${vnpUrl}?${qs.stringify(sortedParams, { encode: false })}`
    console.log('PayMent', paymentUrl)

    res.json(paymentUrl)
  }
  processOrderId = (orderId: string): string => {
    const random = Math.floor(Math.random() * 100)
    return `${orderId}_${random}`
  }

  async vnPay_Return(query: string, res: Response) {
    const vnp_Params = query
    const checkVerify = this.verifyPayment(query)

    //vnp_Params['vnp_ResponseCode'] tu sinh ra do vnpay cap
    if (checkVerify) {
      const orderId: string = vnp_Params['vnp_TxnRef'].split('_')[0]
      const rspCode = vnp_Params['vnp_ResponseCode']
      const vnp_TxnRef = vnp_Params['vnp_TxnRef'] //orderId
      const amount = vnp_Params['vnp_Amount']
      const vnp_Status = vnp_Params['vnp_TransactionStatus']
      const vnp_PayDate = vnp_Params['vnp_PayDate']
      const vnp_BankCode = vnp_Params['vnp_BankCode']
      const order = await this.orderService.findOne(orderId)

      if (!order) throw new UnauthorizedException(messageRespone.ORDER_NOT_FOUND)
      let status
      if (rspCode == '00') {
        order.isPaied = true
        order.transactionId = vnp_TxnRef
        await order.save()
        status = statusTransaction.success
        await this.nodemailerService.sendMailToOrder(order._id, 'Chuyển khoản thành công')
        await this.transactionService.create({
          amount: amount / 100,
          id_customer: order.id_customer,
          order_id: new Types.ObjectId(orderId),
          payDate: vnp_PayDate,
          status,
          transactionId: vnp_TxnRef,
          transactionStatus: vnp_Status
        })
      } else {
        status = statusTransaction.failed
        order.transactionId = vnp_TxnRef
        await Promise.all([
          this.nodemailerService.sendMailToOrder(
            order._id,
            'Chuyển khoản thất bại , đơn hàng sẽ được giữ vào 30p , sau 30p đơn hàng sẽ bị hủy'
          ),
          this.orderService.remove(orderId, 'CHƯA THANH TOÁN THÀNH CÔNG'),
          this.transactionService.create({
            amount: amount / 100,
            id_customer: order.id_customer,
            order_id: new Types.ObjectId(orderId),
            payDate: vnp_PayDate,
            status,
            transactionId: vnp_TxnRef,
            transactionStatus: vnp_Status
          })
        ])
      }
      const queryString = {
        notes: order.notes,
        address: order.address,
        phone: order.phone,
        email: (order.id_customer as any).email || '',
        name: (order.id_customer as any).name || '',
        finalPrice: order.finalPrice,
        vnp_BankCode: vnp_BankCode || 'NaN',
        _id: orderId,
        paymentMethod: order.paymentMethod,
        rspCode,
        status
      }
      // const encryptOrder = encryptData(queryString)

      res.redirect(`myapp://payment-success?${qs.stringify(queryString)}`)
    } else {
      res.render('success', { code: '97' })
    }
  }
  verifyPayment(query: any): boolean {
    try {
      const vnp_Params = query
      const secureHash = vnp_Params['vnp_SecureHash']

      delete vnp_Params['vnp_SecureHash']
      delete vnp_Params['vnp_SecureHashType']

      const sortedParams = this.sortObject(vnp_Params)
      const tmncode = this.configService.get('tmnCode')
      const secretKey = this.configService.get('secretKey')

      const signData = qs.stringify(sortedParams, { encode: false })
      console.log('MA HOA AT VERIFYPAYMENT', `${signData}&vnp_SecureHash=${secureHash}`)

      // Tạo chữ ký SHA512 từ Secret Key
      const hmac = crypto.createHmac('sha512', secretKey)
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
      return secureHash == signed
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.ACCEPTED)
    }
  }

  async handleIpn(query: any, res: Response) {
    console.log('DANG XU LY ......')

    const vnp_Params = query
    const checkVerify = this.verifyPayment(query)

    //vnp_Params['vnp_ResponseCode'] tu sinh ra do vnpay cap
    if (checkVerify) {
      const orderId: string = vnp_Params['vnp_TxnRef'].split('_')[0]
      const rspCode = vnp_Params['vnp_ResponseCode']
      const vnp_TxnRef = vnp_Params['vnp_TxnRef'] //orderId
      const amount = vnp_Params['vnp_Amount']
      const vnp_Status = vnp_Params['vnp_TransactionStatus']
      const vnp_PayDate = vnp_Params['vnp_PayDate']

      const order = await this.orderService.FindOneByID(orderId)

      if (!order) throw new UnauthorizedException(messageRespone.ORDER_NOT_FOUND)
      let status
      if (rspCode == '00') {
        order.isPaied = true
        order.transactionId = vnp_TxnRef
        await order.save()
        status = statusTransaction.success
        await this.nodemailerService.sendMailToOrder(order._id, 'Chuyển khoản thành công')
        res.send('Chuyển khoản thành công , Đơn hàng sẽ đến trong ít phút nữa')
      } else {
        status = statusTransaction.failed
        await this.nodemailerService.sendMailToOrder(
          order._id,
          'Chuyển khoản thất bại , đơn hàng sẽ được giữ vào 30p , sau 30p đơn hàng sẽ bị hủy'
        )
        res.send('Chuyển khoản thất bại , Bạn hãy thanh toán lại')
      }
      return await this.transactionService.create({
        amount: amount / 100,
        id_customer: order.id_customer,
        order_id: new Types.ObjectId(orderId),
        payDate: vnp_PayDate,
        status,
        transactionId: vnp_TxnRef,
        transactionStatus: vnp_Status
      })
    } else {
      res.render('success', { code: '97' })
    }
  }
  async getQuerydr(reqBody: Request) {
    const vnp_TxnRef = reqBody.body.orderId
    const vnp_TransactionDate = moment(reqBody.body.transDate).format('YYYYMMDDHHmmss')
    const vnp_TmnCode = this.configService.get('tmnCode')
    const secretKey = this.configService.get('secretKey')
    const vnp_Api = this.configService.get('vnp_Api')
    const vnp_RequestId = moment(new Date()).format('HHmmss')
    const vnp_Version = '2.1.0'
    const vnp_Command = 'querydr'
    const vnp_OrderInfo = 'Truy van GD ma:' + vnp_TxnRef
    const vnp_IpAddr = this.getClientIp(reqBody)
    const vnp_CreateDate = moment(new Date()).format('YYYYMMDDHHmmss')

    const obj = {
      vnp_RequestId,
      vnp_Version,
      vnp_Command,
      vnp_TmnCode,
      vnp_TxnRef,
      vnp_TransactionDate,
      vnp_OrderInfo,
      vnp_IpAddr,
      vnp_CreateDate
    }

    const objSort = this.sortObject(obj)
    const signData = qs.stringify(objSort, { encode: false })
    const hmac = crypto.createHmac('sha512', secretKey)
    const vnp_SecureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

    const dataObj = {
      ...objSort,
      vnp_SecureHash
    }

    try {
      const res = await axios.post(vnp_Api, dataObj, {
        headers: { 'Content-Type': 'application/json' }
      })
      return res.data
    } catch (err) {
      throw new Error(`VNPAY API Error: ${err.message}`)
    }
  }

  private getClientIp(req: any): string {
    const ip =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : '')

    // Xử lý trường hợp x-forwarded-for có thể có nhiều IP
    if (ip && ip.includes(',')) {
      return ip.split(',')[0].trim() // Lấy địa chỉ IP đầu tiên
    }

    return ip // Trả về địa chỉ IP
  }

  sortObject = (obj) => {
    const sorted = {}
    const str = []
    let key
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key))
      }
    }
    str.sort()
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+')
    }
    return sorted
  }
}
