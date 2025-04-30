import { forwardRef, Module } from '@nestjs/common'
import { NodemailerService } from './nodemailer.service'
import { NodemailerController } from './nodemailer.controller'
import { MailerModule } from '@nestjs-modules/mailer'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { join } from 'path'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { OrdersModule } from 'src/orders/orders.module'
import { AuthModule } from 'src/auth/auth.module'
import { PaymentModule } from 'src/payment/payment.module'
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST'),
          secure: false,
          auth: {
            user: configService.get<string>('EMAIL_AUTH_USER'),
            pass: configService.get<string>('EMAIL_AUTH_PASSWORD')
          }
        },
        preview: configService.get<string>('EMAIL_PREVIEW') == 'true' ? true : false,
        defaults: {
          from: `"No Reply" <${configService.get<string>('EMAIL_FROM')}>`
        },
        template: {
          dir: join(__dirname, 'templetes'),
          adapter: new HandlebarsAdapter({
            inc: (value) => parseInt(value) + 1
          }),
          options: {
            strict: true
          }
        }
      }),
      inject: [ConfigService]
    }),
    forwardRef(() => OrdersModule)
  ],
  controllers: [NodemailerController],
  providers: [NodemailerService],
  exports: [NodemailerService]
})
export class NodemailerModule {}
