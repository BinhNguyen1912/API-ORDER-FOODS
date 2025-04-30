import { forwardRef, Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from 'src/users/users.module'
import { LocalStrategy } from './passport/local.strategy'
import { PassportModule } from '@nestjs/passport'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtStrategy } from './passport/Jwt.Strategy'
import { RoleModule } from 'src/role/role.module'
import { GoogleStrategy } from './passport/google.strategy'
import { MailerModule } from '@nestjs-modules/mailer'
import { NodemailerModule } from 'src/nodemailer/nodemailer.module'

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    forwardRef(() => NodemailerModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('AUTH_SECRET_JWT'),
        signOptions: {
          expiresIn: configService.get<string>('AUTH_ACCESSTOKEN_EXSPIRE')
        }
      }),
      inject: [ConfigService]
    }),
    RoleModule
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
