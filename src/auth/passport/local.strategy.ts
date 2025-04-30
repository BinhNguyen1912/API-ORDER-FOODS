import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { AuthService } from '../auth.service'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'

//pHẦN CODE DƯỚI ĐƯỢC GỌI LÀ ĐĂNG KÍ MỘT CHIẾN LƯỢC LOCAL CỦA PASSPORT
//NHỚ KHAI BÁO TRONG PROVIDER CỦA MODULE NÀY ĐỂ
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }) //Ta có thể thay đổi trường mặc định là username
  }
  //Day la mot phuong thuc bat buoc dung de xac thuc logic
  async validate(email: string, password: string): Promise<any> {
    const users = await this.authService.ValidateUser(email, password)

    if (!users) throw new HttpException('USER NOT FOUND', HttpStatus.UNAUTHORIZED)
    return users
  }
}
