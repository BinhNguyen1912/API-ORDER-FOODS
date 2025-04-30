import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { map, Observable } from 'rxjs'
import { responeMessage } from 'src/Decorators/Customs'
interface responeData<T> {
  message: string
  data: any
}
@Injectable()
export class TransformerInterceptor<T> implements NestInterceptor<T, responeData<T>> {
  constructor(private reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<responeData<T>> {
    return next.handle().pipe(
      map((data) => ({
        message: this.reflector.getAllAndOverride<string>(responeMessage, [context.getHandler(), context.getClass()]),
        data: data
      }))
    )
  }
}
