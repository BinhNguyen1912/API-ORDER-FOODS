import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateFoodDto } from './dto/create-food.dto'
import { UpdateFoodDto } from './dto/update-food.dto'
import { baseRepository } from 'src/base.repository'
import { Food } from './Schema/food.schema'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Category } from 'src/category/Schema/category.schema'
import { CategoryService } from 'src/category/category.service'
import { Payload } from 'src/auth/auth.interface'
import { Types } from 'mongoose'
import aqp from 'api-query-params'
import { messageRespone } from 'src/common/Message'

@Injectable()
export class FoodsService extends baseRepository<Food> {
  constructor(
    @InjectModel(Food.name) private foodModule: SoftDeleteModel<Food>,
    private categoryService: CategoryService
  ) {
    super(foodModule)
  }
  async create(createFoodDto: CreateFoodDto, user: Payload) {
    const { name, category, isBestSeller } = createFoodDto
    const checkName = await this.foodModule.findOne({ name })
    if (checkName) {
      throw new HttpException(messageRespone.NAME_IS_EXITS, HttpStatus.CONFLICT)
    }
    return await this.foodModule.create({
      ...createFoodDto,
      category: new Types.ObjectId(category),
      qualitySold: 0,
      isBestSeller: isBestSeller ? isBestSeller : false,
      createdBy: {
        _id: new Types.ObjectId(user.user_id),
        name: user.name
      }
    })
  }

  async findAll() {
    const foodAll = await this.foodModule.find()
    const _ids = foodAll.map((item) => new Types.ObjectId(item.id))
    console.log(_ids)

    return await this.foodModule.updateMany(
      {},
      { isActive: true },
      {
        returnDocument: 'after'
      }
    )
    return foodAll
  }

  async findOne(id: string) {
    const resuft = await this.foodModule
      .findOne({ _id: new Types.ObjectId(id) })
      .populate({ path: 'category', select: { name: 1 } })
      .select('-deletedAt -isDeleted -updatedAt -createdBy')
    return resuft
  }

  async update(id: string, updateFoodDto: UpdateFoodDto, user: Payload) {
    const { category } = updateFoodDto
    console.log(updateFoodDto)

    if (category) {
      const newupdateFoodDto = {
        ...updateFoodDto,
        category: new Types.ObjectId(category),
        updateBy: {
          _id: user.user_id,
          name: user.name
        }
      }
      return await this.foodModule.updateOne({ _id: id }, { ...newupdateFoodDto })
    }
    return await this.foodModule.updateOne(
      { _id: id },
      {
        ...updateFoodDto,
        updateBy: {
          _id: user.user_id,
          name: user.name
        }
      }
    )
  }
  async FindFoodByName(limit: number = 20, page: number = 1, query: string) {
    try {
      const [Foods, totalDocument] = await Promise.all([
        this.foodModule
          .find({ $text: { $search: query } })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate({
            path: 'category',
            select: 'name'
          })
          .select('name _id price description image category'),
        this.foodModule.find({ $text: { $search: query } })
      ])
      return {
        foods: Foods,
        totalDocument: totalDocument.length || 0,
        totalPage: Math.ceil(totalDocument.length / limit) || 0,
        limit: Number(limit) || 0,
        page: Number(page) || 0
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }
  async FindFoodByCategory(limit: number = 20, page: number = 1, idCategory: string) {
    try {
      const [Foods, totalDocument] = await Promise.all([
        this.foodModule
          .find({ category: new Types.ObjectId(idCategory) })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate({
            path: 'category',
            select: 'name'
          })
          .select('name _id price description image category'),
        this.foodModule.find({ category: new Types.ObjectId(idCategory) })
      ])
      return {
        foods: Foods,
        totalDocument: totalDocument.length || 0,
        totalPage: Math.ceil(totalDocument.length / limit) || 0,
        limit: Number(limit),
        page: Number(page)
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }
  async remove(id: string, user: Payload) {
    try {
      await this.foodModule.updateOne(
        { _id: id },
        {
          deleteBy: {
            _id: user.user_id,
            name: user.name
          }
        }
      )
      return await this.foodModule.softDelete({ _id: id })
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.UNAUTHORIZED)
    }
  }
  async GetListFoods(query: string, page: number = 1, limit: number = 8) {
    try {
      const { filter, population, sort, projection } = aqp(query)
      //Delete skip va limit trong filter
      delete filter.page
      delete filter.limit
      if (filter.category) {
        filter.category = new Types.ObjectId(filter.category)
      }
      const [resuft, totalDocument] = await Promise.all([
        this.foodModule
          .find(filter)
          .populate({
            path: 'category',
            select: 'name'
          })
          .skip((page - 1) * limit)
          .limit(limit)
          .sort(sort as any)
          .populate(population)
          .select('-isDeleted -deletedAt -createdBy -__v')
          .exec(),
        (await this.foodModule.find(filter)).length
      ])
      return {
        foods: resuft,
        totalPage: Math.ceil(totalDocument / limit) || 1,
        totalDocument: totalDocument || 0,
        limit: Number(limit) || 0,
        page: Number(page) || 0
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.UNAUTHORIZED)
    }
  }
  async UpdateSoldFood(ids: { _id: Types.ObjectId; quality: number }[]) {
    const BulkOpt = ids.map((item) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(item._id) },
        update: { $inc: { qualitySold: item.quality } }
      }
    }))

    return await this.foodModule.bulkWrite(BulkOpt)
  }

  async getIDSFood() {
    const ids = await this.foodModule.find().select('_id')
    return ids
  }
}
