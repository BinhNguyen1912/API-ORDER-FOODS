import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { AppGateWay } from './app.gateway'
import { AuthModule } from 'src/auth/auth.module'
import { AuthService } from 'src/auth/auth.service'
import { UsersModule } from 'src/users/users.module'
import { WsAuthMiddleware } from './middleware/gateway.middleware'
import { ConversationModule } from 'src/conversation/conversation.module'

@Module({
  imports: [AuthModule, UsersModule, ConversationModule],
  providers: [AppGateWay, WsAuthMiddleware],
  controllers: []
})
export class GatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Đăng ký middleware cho WebSocket gateway
    consumer
      .apply(WsAuthMiddleware) // Middleware của bạn
      .forRoutes(AppGateWay) // Áp dụng cho route của AppGateway
  }
}
