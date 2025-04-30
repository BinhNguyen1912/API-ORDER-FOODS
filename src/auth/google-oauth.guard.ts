import { ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { messageRespone } from 'src/common/Message'

/*
accessType: Là một tùy chọn trong OAuth 2.0, với giá trị 'offline', 
nó yêu cầu Google cấp một refresh token. Refresh token này cho phép ứng dụng 
làm mới access token mà không cần yêu cầu người dùng đăng nhập lại.
*/
@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor(private configService: ConfigService) {
    super({
      accessType: 'offline'
    })
  }
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req: Request = context.switchToHttp().getRequest()
    if (!req.query.code) throw new HttpException(messageRespone.CODE_NOT_FOUND, HttpStatus.NOT_FOUND)
    return true
  }
}
