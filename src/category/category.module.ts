import { Module } from '@nestjs/common'
import { CategoryService } from './category.service'
import { CategoryController } from './category.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Category, CategorySchema } from './Schema/category.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema, collection: Category.name }])],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService]
})
export class CategoryModule {}
