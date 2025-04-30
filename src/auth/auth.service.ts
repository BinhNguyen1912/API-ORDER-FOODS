import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException
} from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import { Payload, PayLoadSignToken, TokenType, verifyType } from './auth.interface'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { users } from 'src/users/Schema/user.schema'
import { CreateUserDto } from 'src/users/dto/create-user.dto'
import { Types } from 'mongoose'
import { Response } from 'express'
import ms from 'ms'
import axios from 'axios'
import { messageRespone } from 'src/common/Message'
import { NodemailerService } from 'src/nodemailer/nodemailer.service'
import { ChangePasswordDto, ForgotPasswordDto } from './Dto/ChangePassword.Dto'
import { randomBytes } from 'crypto'
@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private jtwService: JwtService,
    private configService: ConfigService,
    private nodemailerService: NodemailerService
  ) {}
  async ValidateUser(email: string, password: string) {
    const user = await this.userService.checkMail(email)
    if (!user) throw new HttpException('Email Not Exist!', HttpStatus.UNAUTHORIZED)
    if (user.password != this.userService.HassPassword(password)) {
      throw new HttpException('Password Not Match!', HttpStatus.UNAUTHORIZED)
    }
    return user
  }
  async SignAcess_Refresh(payload: Payload) {
    return await Promise.all([
      this.SignAccessToken({ ...payload, tokenType: TokenType.access_token }),
      this.SignRefreshToken({ ...payload, tokenType: TokenType.refresh_token })
    ])
  }
  async SignAccessToken(payload: Payload) {
    const payload_addType: Payload = {
      ...payload,
      tokenType: TokenType.access_token // 0
    }
    return this.jtwService.sign(payload_addType, {
      secret: this.configService.get<string>('AUTH_ACCESSTOKEN'),
      expiresIn: this.configService.get<string>('AUTH_ACCESSTOKEN_EXSPIRE')
    })
  }
  async SignRefreshToken(payload: Payload) {
    const payload_addType: Payload = {
      ...payload,
      tokenType: TokenType.refresh_token
    }
    return this.jtwService.sign(payload_addType, {
      secret: this.configService.get<string>('AUTH_REFRESHTOKEN'),
      expiresIn: this.configService.get<string>('AUTH_REFRESHTOKEN_EXSPIRE')
    })
  }

  //Dành riêng cho việc đăng ký mã cho quên mật khẩu , xác minh tài khoản
  async SignVerifyToken(payload: PayLoadSignToken) {
    const payload_addType = {
      ...payload,
      tokenType: TokenType.verify_token
    }
    return this.jtwService.sign(payload_addType, {
      secret: this.configService.get<string>('AUTH_VERIFY_TOKEN'),
      expiresIn: this.configService.get<string>('AUTH_VERIFY_TOKEN_EXSPIRE')
    })
  }
  async Login(user: users, res: Response) {
    const { email, role, name, _id, phone, avatar } = user
    const payload: Payload = {
      email,
      name,
      role,
      user_id: _id,
      phone
    }
    const [access_token, refresh_token] = await this.SignAcess_Refresh(payload)
    res.clearCookie('refresh_token')
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('AUTH_REFRESHTOKEN_EXSPIRE'))
    })
    await this.userService.updateRefreshToken(refresh_token, _id.toString())
    console.log(`${user.name} login.......`)

    return { user: { email, name, role, _id, avatar }, access_token }
  }
  async RegisterByUser(createdUserDto: CreateUserDto) {
    console.log(createdUserDto)
    const { email } = createdUserDto
    const checkMail = await this.userService.checkMail(email)
    if (checkMail) {
      // console.log('ton tai mail roi')
      throw new UnprocessableEntityException(messageRespone.EMAIL_EXITS)
    }
    // console.log('bi lot ra ngoai')

    const _id = new Types.ObjectId()

    return await this.userService.createByUser(createdUserDto, _id)
  }
  async RegisterByAdmin(createdUserDto: CreateUserDto) {
    const user = await this.userService.createByAdmin(createdUserDto)
    return {
      _id: user._id,
      name: user.name
    }
  }
  //Xu ly code tra ve
  async verifyCode(code: string, id: string) {
    if (!code) throw new HttpException(messageRespone.NOT_FOUND_CODE, HttpStatus.NOT_FOUND)
    const user = await this.userService.checkCode(code, id)
    console.log('user', user)

    return user
  }
  //Ham xu ly token cho xac minh tai khoan , quen mat khau
  async handle_verifyTokenAndUpdatePassword(access_token: string, newPassword: string) {
    try {
      const decodedToken = decodeURIComponent(access_token) //xu ly neu url từ cách thành +
      const token = decodedToken.split(' ')[1]
      const secret = this.configService.get<string>('AUTH_VERIFY_TOKEN')
      if (!secret) {
        throw new Error('Secret for access token is not defined in configuration')
      }
      const decode = this.jtwService.verify<Payload>(token, { secret })
      if (!decode) {
        throw new HttpException(messageRespone.VERIFY_FAILED, HttpStatus.UNAUTHORIZED)
      }
      const user: users = await this.userService.FindOneByID(decode.user_id.toString())
      if (!user) throw new HttpException('User Not Found', HttpStatus.UNAUTHORIZED)

      user.password = this.userService.HassPassword(newPassword)
      // await user.save()
      await Promise.all([
        this.userService.UpdateVerifyCodeAndToken({
          token: '',
          id: decode.user_id.toString(),
          code: ''
        }),
        user.save()
      ])
      return messageRespone.VERIFY_SUCCESS
    } catch (error) {
      throw new UnauthorizedException(error.message)
    }
  }

  //Giải mã token cho gateway
  async verifyToken(access_token: string): Promise<Payload> {
    try {
      const token = access_token.split(' ')[1]
      const secret = this.configService.get<string>('AUTH_ACCESSTOKEN')
      if (!secret) {
        throw new Error('Secret for access token is not defined in configuration')
      }
      const decode = this.jtwService.verify<Payload>(token, { secret })
      return decode
    } catch (error) {
      throw new HttpException(`Error verifying token: ${error.message}`, HttpStatus.UNAUTHORIZED)
    }
  }
  async getAccessByRefresh(refresh_token: string, res: Response) {
    const user = await this.userService.GetUserByRefresh(refresh_token)
    return await this.Login(user, res)
  }
  generateCode(length: number = 6) {
    return randomBytes(length).toString('hex').toUpperCase().slice(0, length)
  }
  async forgotPassword(email: string) {
    console.log('FORGOT PASSWORD')

    const user: users = await this.userService.checkMail(email)
    // console.log(user)

    if (!user) throw new HttpException('User Not Found', HttpStatus.UNAUTHORIZED)
    const verify_token = await this.SignVerifyToken({ email, user_id: user.id })
    // console.log('Email say Token For Forgot Password : ', verify_token)
    const code = this.generateCode()
    await this.nodemailerService.sendToCodeForAuthen(user, code.toString())

    await this.userService.UpdateVerifyCodeAndToken({
      id: user.id.toString(),
      token: verify_token,
      code: code.toString()
    })
    return {
      id: user.id.toString(),
      token: user.verify_token
    }
  }
  // async changeForgotPassword(changeforgotPassword: ForgotPasswordDto, id: string) {
  //   const { confirm_password, newPassword } = changeforgotPassword
  //   //check xem ng dùng đã verify chưa
  //   const checkVerifyToken: users = await this.userService.FindOneByID(id)
  //   if (checkVerifyToken.verify_token != '') {
  //     throw new HttpException(messageRespone.USER_NOT_VERIFY, HttpStatus.UNAUTHORIZED)
  //   }
  //   if (confirm_password != newPassword) {
  //     throw new HttpException(messageRespone.PASSWORD_AND_CONFIRMPASS_NOT_MATCHES, HttpStatus.UNAUTHORIZED)
  //   }
  //   return await this.userService.changePassword(newPassword, id)
  // }
  async ChangePassword(changePassword: ChangePasswordDto, id: string) {
    const { newPassword, oldPassword } = changePassword
    const user: users = await this.userService.FindOneByID(id)
    if (this.userService.HassPassword(oldPassword) != user.password) {
      throw new HttpException(messageRespone.WRONG_PASSWORD, HttpStatus.UNPROCESSABLE_ENTITY)
    }
    return await this.userService.changePassword(newPassword, id)
  }
  async getAccount(id: string) {
    return await this.userService.findOne(id)
  }
  async Logout(user: Payload, res: Response) {
    try {
      const id = user.user_id.toString()
      const User = await this.userService.FindOneByID(id)
      if (User.refresh_token) User.refresh_token = ''
      await User.save()
      res.clearCookie('refresh_token')
    } catch (err) {
      throw new UnauthorizedException(err.message)
    }
  }
  async getOauthByToken(code: string) {
    const body = {
      code,
      client_id: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      client_secret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      redirect_uri: this.configService.get<string>('GOOGLE_CALLBACK_URL'),
      grant_type: 'authorization_code'
    }
    //chú ý nhớ cái url , những cái bên dưới được GG bắt buộc yêu cầu
    try {
      const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      return data as {
        access_token: string
        scope: string
        expires_in: number
        id_token: string
        token_type: string
      }
    } catch (err) {
      throw new Error(err.message)
    }
    //chúng ta sẽ ép kiểu cho nó trả về KDL gì cho ta
  }
  private async getGoogleUserInfo(id_token: string, access_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data as {
      id: string
      email: string
      name: string
      picture: string
      verified_email: boolean
    }
  }
  async Oath(code: string, res: Response) {
    //Nhờ ở trên ép kiểu nên nó sẽ gợi ý cho ta các thằng mình ép kiểu
    const { id_token, access_token } = await this.getOauthByToken(code)
    const resuft = await this.getGoogleUserInfo(id_token, access_token)
    //xác minh email này đã verify chưa ?
    if (!resuft.verified_email) {
      throw new HttpException(messageRespone.ACCOUNT_NOT_VERIFY, HttpStatus.UNAUTHORIZED)
    }
    // }
    //Kiểm tra email đã có chua ? login : register
    const user: users = await this.userService.checkMail(resuft.email)

    //Xử lý trường hợp đã có => Cho đăng nhập và xử dụng các quyền
    if (user) {
      return await this.Login(user, res)
    }
    //Nếu không có thì mình phải đăng ký 1 user cho hệ thông của mình
    const createUserDto: CreateUserDto = {
      email: resuft.email,
      name: resuft.name,
      password: '123456',
      role: new Types.ObjectId('67401e35ab8b20b36cdaaa97'),
      avatar: resuft.picture,
      phone: ''
    }
    const createUser = await this.userService.createByAdmin({ ...createUserDto })
    return await this.Login(createUser, res)
  }
}
