import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
  ValidationPipe
} from '@nestjs/common'
import { LocalStrategy } from './passport/local.strategy'
import { LocalAuthGuard } from './Local.guard'
import { CreateUserDto, LoginDto } from 'src/users/dto/create-user.dto'
import { AuthService } from './auth.service'
import { DecodeToken, Public, responeMessage, ResponeMessage } from 'src/Decorators/Customs'
import { Payload, TokenType } from './auth.interface'
import { Request as RqExpress, response, Response } from 'express'
import { messageRespone } from 'src/common/Message'
import { GoogleOAuthGuard } from './google-oauth.guard'
import { ConfigService } from '@nestjs/config'
import { ChangePasswordDto, ForgotPasswordDto, VerifyEmailDto } from './Dto/ChangePassword.Dto'
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {}
  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponeMessage('Login Success')
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    return await this.authService.Login(req.user, res)
  }

  @Post('registerByUser')
  @Public()
  @ResponeMessage('Sign Success')
  async RegisterUser(@Body() createdUserDto: CreateUserDto) {
    return await this.authService.RegisterByUser(createdUserDto)
  }

  @Post('registerByAdmin')
  @ResponeMessage('Sign Success')
  async RegisterAdmin(@Body() createdUserDto: CreateUserDto, @DecodeToken() user: Payload) {
    return await this.authService.RegisterByAdmin(createdUserDto)
  }

  @Public()
  @ResponeMessage(messageRespone.GET_SUCCESS)
  @Get('GetAccessTokenByRefreshToken')
  async getNewAccess(@Req() req: RqExpress, @Res({ passthrough: true }) res: Response) {
    const refresh_token = req.cookies['refresh_token']
    return await this.authService.getAccessByRefresh(refresh_token, res)
  }

  // @ResponeMessage('Verify Success')
  // @Post('verify/verifyToken')
  // @Public()
  // async VerifyToken(@Query('token') token: string) {
  //   return await this.authService.verifyToken(token)
  // }

  @Post('forgotPassword')
  @Public()
  @ResponeMessage('Code sent to your email')
  async ForgotPassword(@Body() verifyEmailDto: VerifyEmailDto) {
    const { email } = verifyEmailDto
    return await this.authService.forgotPassword(email)
  }
  @Post('Verify-Code')
  @Public()
  @ResponeMessage(messageRespone.VERIFY_SUCCESS)
  async VerifyCode(@Body() body: { id: string; code: string }) {
    const { code, id } = body
    return await this.authService.verifyCode(code, id)
  }

  //xác minh token và cập nhật mật khẩu
  @Get('verifyTokenAndUpdatePassword')
  @Public()
  @ResponeMessage(messageRespone.CHANGE_PASSWORD_SUCCESS)
  async verifyTokenForAuthen(@Query('token') token: string, @Query('newPassword') newPassword: string) {
    console.log('Token:', token)
    console.log(newPassword)

    return await this.authService.handle_verifyTokenAndUpdatePassword(token, newPassword)
  }

  // //Quen mat khau
  // @Post('changeForgotPassword')
  // @ResponeMessage('Change Success')
  // async ChangeForgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto, @Req() req) {
  //   const id: string = req.user.user_id
  //   console.log(req.user)

  //   return await this.authService.changeForgotPassword(forgotPasswordDto, id)
  // }

  //Doi mat khau
  @Post('changePassword')
  @ResponeMessage('Đổi mật khẩu thành công')
  async ChangePassword(@Body() changePassword: ChangePasswordDto, @DecodeToken() user: Payload) {
    const id: string = user.user_id.toString()
    return await this.authService.ChangePassword(changePassword, id)
  }

  @Get('GetAccount')
  @ResponeMessage(messageRespone.GET_SUCCESS)
  async GetAccount(@DecodeToken() user: Payload) {
    return await this.authService.getAccount(user.user_id.toString())
  }

  @Get('Logout')
  @ResponeMessage(messageRespone.LOGOUT_SUCCESS)
  async Logout(@DecodeToken() user: Payload, @Res({ passthrough: true }) res: Response) {
    return await this.authService.Logout(user, res)
  }

  @Get('Oauth/google') // Route cụ thể
  @UseGuards(GoogleOAuthGuard) // Sử dụng GoogleOAuthGuard để xử lý
  @Public()
  @ResponeMessage(messageRespone.LOGIN_SUCCESS)
  async googleAuth(@Res() res: Response, @Query('code') code: string) {
    const resuft = await this.authService.Oath(code, res)
    const { access_token } = resuft
    const urlRedirect = `${this.configService.get<string>('GOOGLE_REDIRECT_CALLBACK')}?access_token=${access_token}`
    res.redirect(urlRedirect)
  }
}
