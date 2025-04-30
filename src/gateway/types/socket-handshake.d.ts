import 'socket.io'
import { users } from 'src/users/Schema/user.schema'

declare module 'socket.io' {
  interface Handshake {
    user?: users // Thay `any` bằng kiểu chính xác của user nếu bạn biết
  }
}
