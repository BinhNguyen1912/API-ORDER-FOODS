import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { softDeletePlugin } from 'soft-delete-plugin-mongoose'
import { UsersModule } from './users/users.module'
import { AuthService } from './auth/auth.service'
import { AuthModule } from './auth/auth.module'
import { JwtModule } from '@nestjs/jwt'
import { FoodsModule } from './foods/foods.module'
import { CategoryModule } from './category/category.module'
import { OrdersModule } from './orders/orders.module'
import { TransactionsModule } from './transactions/transactions.module'
import { PaymentModule } from './payment/payment.module'
import { CartsModule } from './carts/carts.module'
// import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager'
import { MulterModule } from '@nestjs/platform-express'
import { FilesModule } from './files/files.module'
import { MulterConfigOption } from './files/files.config'
import { NodemailerModule } from './nodemailer/nodemailer.module'
import { MailerModule } from '@nestjs-modules/mailer'
import { PermissionModule } from './permission/permission.module'
import { RoleModule } from './role/role.module'
import { CommentModule } from './comment/comment.module'
import { DiscountModule } from './discount/discount.module'
import { UserVoucherModule } from './user-voucher/user-voucher.module'
import { CacheModule } from '@nestjs/cache-manager'
import { ScheduleModule } from '@nestjs/schedule'
import { GatewayModule } from './gateway/gateway.module'
import { AppGateWay } from './gateway/app.gateway'
import { WsAuthMiddleware } from './gateway/middleware/gateway.middleware'
import { ConversationModule } from './conversation/conversation.module'
import { GoogleStrategy } from './auth/passport/google.strategy'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { OrderFoodHistoryModule } from './order-food-history/order-food-history.module';
@Module({
  imports: [
    CacheModule.register({
      isGlobal: true
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 6000,
        limit: 20
      }
    ]),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        connectionFactory: (connection) => {
          connection.plugin(softDeletePlugin)
          return connection
        }
      }),
      inject: [ConfigService]
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    UsersModule,
    AuthModule,
    JwtModule,
    FoodsModule,
    CategoryModule,
    OrdersModule,
    TransactionsModule,
    PaymentModule,
    CartsModule,
    FilesModule,
    NodemailerModule,
    PermissionModule,
    RoleModule,
    CommentModule,
    DiscountModule,
    UserVoucherModule,
    GatewayModule,
    ConversationModule,
    OrderFoodHistoryModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthService,
    GoogleStrategy,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
