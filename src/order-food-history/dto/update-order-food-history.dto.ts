import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderFoodHistoryDto } from './create-order-food-history.dto';

export class UpdateOrderFoodHistoryDto extends PartialType(CreateOrderFoodHistoryDto) {}
