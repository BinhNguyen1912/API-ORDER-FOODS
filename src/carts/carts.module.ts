import { Module } from '@nestjs/common'
import { CartsService } from './carts.service'
import { CartsController } from './carts.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Cart, CartSchema } from './Schema/cart.schema'
import { OrdersModule } from 'src/orders/orders.module'
import { FoodsModule } from 'src/foods/foods.module'

@Module({
  imports: [MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema, collection: Cart.name }]), FoodsModule],
  controllers: [CartsController],
  providers: [CartsService],
  exports: [CartsService]
})
export class CartsModule {}
