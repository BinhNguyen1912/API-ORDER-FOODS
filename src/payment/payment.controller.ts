import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  HttpCode,
  UnauthorizedException,
  Res,
  Req,
  Query,
  Render
} from '@nestjs/common'
import { PaymentService } from './payment.service'
import { CreatePaymentDto } from './dto/create-payment.dto'
import { UpdatePaymentDto } from './dto/update-payment.dto'
import crypto from 'crypto'
import axios from 'axios'
import { Request, Response } from 'express'
import { DecodeToken, Public } from 'src/Decorators/Customs'
import { ConfigService } from '@nestjs/config'
import * as qs from 'qs'
import { Payload } from 'src/auth/auth.interface'

@Public()
@Controller('')
export class PaymentController {
  accessKey = 'F8BBA842ECF85'
  secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz'
  constructor(
    private readonly paymentService: PaymentService,
    private configService: ConfigService
  ) {}

  @HttpCode(200)
  @Post('payment')
  async create(@Body() createPaymentDto: any) {
    //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
    //parameters\

    const orderInfo = 'pay with MoMo'
    const partnerCode = 'MOMO'
    const redirectUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b'
    const ipnUrl = 'https://e77e-42-114-171-32.ngrok-free.app/callback'
    const requestType = 'payWithMethod'
    const amount = '1000'
    const orderId = partnerCode + new Date().getTime()
    const requestId = orderId
    const extraData = ''
    const orderGroupId = ''
    const autoCapture = true
    const lang = 'vi'

    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    const rawSignature =
      'accessKey=' +
      this.accessKey +
      '&amount=' +
      amount +
      '&extraData=' +
      extraData +
      '&ipnUrl=' +
      ipnUrl +
      '&orderId=' +
      orderId +
      '&orderInfo=' +
      orderInfo +
      '&partnerCode=' +
      partnerCode +
      '&redirectUrl=' +
      redirectUrl +
      '&requestId=' +
      requestId +
      '&requestType=' +
      requestType
    //puts raw signature
    console.log('--------------------RAW SIGNATURE----------------')
    console.log(rawSignature)
    //signature
    const signature = crypto.createHmac('sha256', this.secretKey).update(rawSignature).digest('hex')
    console.log('--------------------SIGNATURE----------------')
    console.log(signature)

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      orderGroupId: orderGroupId,
      signature: signature,
      orderExpireTime: 200000
    })
    //Create the HTTPS objects
    const options = {
      url: 'https://test-payment.momo.vn/v2/gateway/api/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      },
      data: requestBody
    }
    let resuft
    try {
      resuft = await axios(options)

      return resuft.data
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.UNAUTHORIZED)
    }
  }

  @Post('callback')
  findAll(@Body() body: any) {
    console.log('>>>Callback : ')

    console.log(body)
    return body
  }

  @Post('transaction_status/:orderId')
  async findOne(@Param('orderId') orderId: string) {
    console.log(orderId)

    const rawSignature = `accessKey=${this.accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`
    const signature = crypto.createHmac('sha256', this.secretKey).update(rawSignature).digest('hex')
    const requestBody = {
      partnerCode: 'MOMO',
      requestId: orderId,
      orderId,
      signature,
      lang: 'vi'
    }
    const option = {
      url: 'https://test-payment.momo.vn/v2/gateway/api/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: requestBody
    }
    try {
      const resuft = await axios(option)
      return resuft.data
    } catch (error) {
      throw new UnauthorizedException(error.message)
    }
  }
  @Get('/querydr')
  querydr(@Res() res: Response) {
    res.render('querydr', { title: 'Truy vấn kết quả thanh toán' })
  }

  @Get('/refund')
  refund(@Res() res: Response) {
    res.render('refund', { title: 'Hoàn tiền giao dịch thanh toán' })
  }

  @Get('/')
  getOrderList(@Res() res: Response) {
    res.render('orderlist', { title: 'Danh sách đơn hàng' })
  }

  @Get('/create_payment_url')
  async getCreatePaymentUrl(@Res() res: Response) {
    res.render('order', { title: 'Tạo mới đơn hàng', amount: 10000 })
  }

  @Post('/create_payment_url')
  async createPaymentUrl(@Req() req: Request, @Res() res: Response, @Body() body: CreatePaymentDto) {
    // const vnpUrl = await this.paymentService.createPaymentUrl(req, body.orderId)
    // res.redirect(vnpUrl)
  }

  @Get('/vnpay_return')
  async vnpayReturn(@Query() query: any, @Res() res: Response, @DecodeToken() User: Payload) {
    return this.paymentService.vnPay_Return(query, res)
  }

  @Get('/vnpay_ipn')
  async vnpayIpn(@Query() query: string, @Res() res: Response) {
    return this.paymentService.handleIpn(query, res)
  }

  @Post('/querydr')
  async querydrPost(@Req() req: Request) {
    return await this.paymentService.getQuerydr(req)
  }
}
