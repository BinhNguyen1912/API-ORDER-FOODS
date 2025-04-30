import { IsNumber, IsOptional, IsString, Min } from 'class-validator'

export default class SchemaPagination {
  @IsNumber()
  @IsOptional()
  @Min(1)
  page: number
  @IsNumber()
  @IsOptional()
  @Min(1)
  limit: number
  @IsString()
  @IsOptional()
  query: string
}
