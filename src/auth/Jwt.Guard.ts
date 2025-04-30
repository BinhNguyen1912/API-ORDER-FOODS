import { ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { messageRespone } from 'src/common/Message'
import { IS_PUBLIC } from 'src/Decorators/Customs'
import { Permission } from 'src/permission/Schema/permission.schema'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }
  canActivate(context: ExecutionContext) {
    // const req = context.switchToHttp().getRequest()
    // console.log('req : ', req)
    const Is_Public = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()])

    if (Is_Public) {
      return true
    }

    // console.log(req.route.path)
    // console.log(req.method)

    return super.canActivate(context)
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    try {
      const req = context.switchToHttp().getRequest()
      // // console.log(req)
      // // console.log('err', err)
      // const Is_Public = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()])

      // if (Is_Public) {
      //   return true
      // }
      // console.log('Is_Public', Is_Public)

      if (err || !user) {
        throw new UnauthorizedException('Token Không hợp lệ')
      }
      //Xử lý các endpoint của auth là public , ai cũng được sử dụng

      if ((req.path as string).startsWith('/api/v1/auth')) {
        console.log('/api/v1/auth')
        return user
      }
      const reqPath = req.route.path
      console.log('reqPath : ', reqPath)

      const reqMethod = req.method
      console.log('reqMethod: ', reqMethod)

      const permissons = user.permissions ? user.permissions : []
      const checkPermission = permissons.find((item) => {
        if (item.path == reqPath && item.method == reqMethod && item.isActive) {
          return true
        }
      })
      // console.log('permissons : ', permissons)

      // if (!checkPermission) {
      //   throw new HttpException(messageRespone.FORBIDENT, HttpStatus.FORBIDDEN)
      // }

      return user
    } catch (err) {
      throw new UnauthorizedException(err.message)
    }
  }
}
