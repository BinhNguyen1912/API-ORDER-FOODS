import { CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common'
import { Observable } from 'rxjs'
import { isValidObjectId } from 'mongoose'

export class CheckID implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest()
    const id: string = req.params
    if (id) {
      if (!isValidObjectId(id)) {
        throw new HttpException('ID NOT FORMAT', HttpStatus.UNPROCESSABLE_ENTITY)
      }
    }
    return true
  }
}
