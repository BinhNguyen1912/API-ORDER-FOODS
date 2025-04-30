import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { Socket } from 'socket.io'
import { Payload, verifyType } from 'src/auth/auth.interface'
import { AuthService } from 'src/auth/auth.service'
import { messageRespone } from 'src/common/Message'
import { users } from 'src/users/Schema/user.schema'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class WsAuthMiddleware implements NestMiddleware {
  constructor(
    private authService: AuthService,
    private userService: UsersService
  ) {}
  async use(socket: Socket, next: NextFunction) {
    const token = socket.handshake.auth?.Authorization
    if (!token) next(new HttpException(messageRespone.TOKEN_NOT_FOUND, HttpStatus.NOT_FOUND))
    try {
      const decodeAccess: Payload = await this.authService.verifyToken(token)
      const user: users = await this.userService.FindOneByID(String(decodeAccess.user_id))
      if (user.verify != verifyType.verify || user.verify_token != '') {
        throw new HttpException(messageRespone.ACCOUNT_NOT_VERIFY, HttpStatus.FORBIDDEN)
      }
      socket.data.user = user
      next()
    } catch (err) {
      // return
      next(new Error(err.message))
    }
  }
}
