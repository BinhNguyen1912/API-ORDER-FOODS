import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Payload, TokenType } from '../auth.interface'
import { RoleService } from 'src/role/role.service'
import { Permission } from 'src/permission/Schema/permission.schema'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private roleService: RoleService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (request, rawJwtToken, done) => {
        try {
          const payload: Payload = this.decodeJwtToken(rawJwtToken)
          let secret
          if (payload.tokenType !== undefined && payload.tokenType === TokenType.access_token) {
            secret = this.configService.get<string>('AUTH_ACCESSTOKEN')
          } else if (payload.tokenType === TokenType.refresh_token) {
            secret = this.configService.get<string>('AUTH_REFRESHTOKEN')
          } else if (payload.tokenType === TokenType.verify_token) {
            secret = this.configService.get<string>('AUTH_VERIFY_TOKEN')
          } else {
            secret = this.configService.get<string>('AUTH_SECRET_JWT')
          }

          if (!secret) {
            return done(new Error('Secret not found'), null)
          }
          done(null, secret) // Gọi callback với secret đúng
        } catch (error) {
          done(error, null) // Gọi callback với lỗi
        }
      }
    })
  }

  //Hàm giúp decode phần payload mà không cần Secret
  decodeJwtToken(token: string) {
    const [header, payload, signature] = token.split('.')
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString())
    return decodedPayload
  }
  async validate(payload: Payload) {
    try {
      const { email, name, phone, user_id, role, tokenType } = payload

      // Kiểm tra nếu role không có hoặc không hợp lệ
      if (!role) {
        throw new UnauthorizedException('Role not found')
      }

      const result = await this.roleService.findOne(role.toString())

      if (!result) {
        throw new UnauthorizedException('Role not found in database')
      }

      const permissions = result ? result.permissions : []
      // console.log('permissions at Strategy', permissions)

      return { email, name, phone, user_id, permissions }
    } catch (err) {
      // Cung cấp thêm thông tin về lỗi trong exception
      throw new UnauthorizedException(`Validation failed: ${err.message}`)
    }
  }
}
