import { Module } from '@nestjs/common'
import { FoodsService } from './foods.service'
import { FoodsController } from './foods.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Food, foodsSchema } from './Schema/food.schema'
import { Category, CategorySchema } from 'src/category/Schema/category.schema'
import { CategoryModule } from 'src/category/category.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Food.name, schema: foodsSchema, collection: Food.name },
      { name: Category.name, schema: CategorySchema, collection: Category.name }
    ]),
    CategoryModule
  ],
  controllers: [FoodsController],
  providers: [FoodsService],
  exports: [FoodsService]
})
export class FoodsModule {}
