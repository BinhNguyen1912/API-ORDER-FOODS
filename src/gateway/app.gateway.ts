import { HttpException, HttpStatus, Logger, UseGuards } from '@nestjs/common'
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { AuthService } from 'src/auth/auth.service'
import { WsAuthMiddleware } from './middleware/gateway.middleware'
import { users } from 'src/users/Schema/user.schema'
import { messageRespone } from 'src/common/Message'
import { Conversation } from 'src/conversation/schema/conversation.schema'
import { CreateConversationDto } from 'src/conversation/dto/create-conversation.dto'
import { ConversationService } from 'src/conversation/conversation.service'
import { ConversationType } from './types/interface'
@WebSocketGateway({ cors: '*' })
export class AppGateWay implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  //Khoi tao server (la io ben express)
  private userOnline: { username: string; user_id: string }[] = []
  private UserArr = new Map<string, string>()

  @WebSocketServer()
  io: Server
  constructor(
    private authService: AuthService,
    private wsAuthMiddleware: WsAuthMiddleware,
    private ConversationService: ConversationService
  ) {}
  afterInit(server: Server) {
    console.log('Gateway Initialized')
  }
  async handleConnection(@ConnectedSocket() socket: Socket) {
    // Gọi middleware trực tiếp trong đây , vì đây là kết nối duy trì nên phải tự gọi thủ công
    try {
      await this.wsAuthMiddleware.use(socket, (err) => {
        if (err) {
          throw new HttpException(err.message, HttpStatus.UNAUTHORIZED)
        }
      })
      const user: users = socket.data.user

      if (!user) throw new HttpException(messageRespone.USER_NOT_FOUND, HttpStatus.NOT_FOUND)
      this.UserArr.set(user._id.toString(), socket.id.toString())
      this.userOnline.push({
        user_id: user._id.toString(),
        username: user.name
      })
      console.log(`${user.name}-${socket.id}-${user._id.toString()} connected`)
      // console.log('ArrUser : ', this.UserArr)
      console.log('Danh sach online', this.userOnline)
      socket.emit('ListUserOnline', this.userOnline)
    } catch (error) {
      console.log(error.message)
      socket.emit('error_event', { message: error.message })
      socket.disconnect()
    }
  }
  handleDisconnect(socket: Socket) {
    try {
      const user: users = socket.data.user
      if (!user) throw new HttpException(messageRespone.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED)
      console.log(`${user.name}-${socket.id}-${user._id.toString()} disconnected..............................`)

      this.UserArr.delete(user._id.toString())
      this.userOnline.map((item) => {
        if (item.username == user.name && item.user_id == user._id.toString()) {
          const index = this.userOnline.indexOf(item)
          this.userOnline.splice(index, 1)
        }
      })
      // console.log('ArrUser : ', this.UserArr)
      // console.log('Danh sach online', this.userOnline)
    } catch (err) {
      console.log(err.message)
      socket.emit('error_event', { message: err.message })
      socket.disconnect()
    }
  }
  @SubscribeMessage('private_message')
  async handleMessage(client: Socket, data: Conversation) {
    try {
      const conversation: CreateConversationDto = {
        content: data.content,
        receiver: data.receiver,
        sender: data.sender
      }
      // console.log('conversation : ', conversation)

      const resuft = await this.ConversationService.create(conversation)
      // console.log('resuft At app.gateway : ', resuft)

      const receiver_id = this.UserArr.get(data.receiver.toString()) //nguoi nhan
      // console.log('receiver_id At app.gateway : ', receiver_id)

      if (!receiver_id) return
      const payload: ConversationType = {
        content: data.content,
        sender: data.sender.toString(),
        receiver: data.receiver.toString(),
        _id: resuft._id
      }
      // console.log('Nguoi nhan : ', receiver_id, ' - ', data.receiver.toString())

      client.to(receiver_id).emit('receiver_private_message', {
        payload
      })
    } catch (err) {
      client.emit('error_event', err)
    }
  }
}
