import { OmitType, PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const) // Loại bỏ trường password
) {}
/**
Cách 1: Sử dụng @Exclude() nếu bạn muốn tự động loại bỏ password khỏi đối tượng DTO khi ánh xạ dữ liệu.
 @Exclude()
  password?: string; // Loại bỏ trường password khỏi quá trình cập nhật
Cách 3: Sử dụng @OmitType() để loại bỏ hoàn toàn trường password khỏi UpdateUserDto.
-- Như cách trên
 */
