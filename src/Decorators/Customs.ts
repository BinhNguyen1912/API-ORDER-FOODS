import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common'

export const IS_PUBLIC = 'is_public'
export const Public = () => SetMetadata(IS_PUBLIC, true)

export const responeMessage = 'Respone_Message'
export const ResponeMessage = (message: string) => SetMetadata(responeMessage, message)

export const DecodeToken = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest()
  return req.user
})
