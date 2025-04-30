import { ValidateIf } from '@nestjs/class-validator'
import { IsDefined, IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator'
import { messageRespone } from 'src/common/Message'
export class VerifyEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string
}

export class ForgotPasswordDto {
  @IsString()
  @MinLength(6, { message: messageRespone.PASSWORD_TOO_SHORT })
  newPassword: string

  @IsString()
  @IsDefined({
    message: 'Cần xác nhận lại mật khẩu mới'
  })
  @ValidateIf((obj, vl) => vl == obj.newPassword)
  confirm_password: string
}
export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string

  @IsString()
  @IsNotEmpty()
  newPassword: string

  @IsString()
  @IsNotEmpty()
  confirmPassword: string
}
