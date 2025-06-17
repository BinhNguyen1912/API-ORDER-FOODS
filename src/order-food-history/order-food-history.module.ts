import { Module } from '@nestjs/common'
import { OrderFoodHistoryService } from './order-food-history.service'
import { OrderFoodHistoryController } from './order-food-history.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { OrderFoodHistory, OrderFoodHistorySchema } from './Schema/order-food-history.entity'

@Module({
  imports: [MongooseModule.forFeature([{ name: OrderFoodHistory.name, schema: OrderFoodHistorySchema }])],
  controllers: [OrderFoodHistoryController],
  providers: [OrderFoodHistoryService],
  exports: [OrderFoodHistoryService]
})
export class OrderFoodHistoryModule {}
