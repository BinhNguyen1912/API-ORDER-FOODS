import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

//AuthGuard này lấy từ passport vì vậy nó sẽ compine với localStrategy để xử lý logic
//Nhớ sử dụng Guard trước cái Route muốn nó chạy , nhưng đối với trường hợp này se chạy ở phần login
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
