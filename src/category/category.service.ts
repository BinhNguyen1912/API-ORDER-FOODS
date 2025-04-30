import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Category } from './Schema/category.schema'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { messageRespone } from 'src/common/Message'
import { Payload } from 'src/auth/auth.interface'

@Injectable()
export class CategoryService {
  constructor(@InjectModel(Category.name) private categoryModule: SoftDeleteModel<Category>) {}
  async FindAndCreate(name: string) {
    const resuft = await this.categoryModule.findOneAndUpdate(
      {
        name
      },
      {
        $setOnInsert: new this.categoryModule({ name })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return resuft
  }
  async create(createCategoryDto: CreateCategoryDto) {
    const { name } = createCategoryDto
    const checkCategory = await this.categoryModule.findOne({ name })
    console.log(checkCategory)

    if (checkCategory) {
      throw new HttpException(messageRespone.CATEGORY_IS_EXITS, HttpStatus.NOT_FOUND)
    }
    return await this.categoryModule.create({ ...createCategoryDto })
  }
  async findAll(limit: number = 20, page: number) {
    try {
      const [Categorys, totalDocument] = await Promise.all([
        this.categoryModule
          .find({})
          .skip((page - 1) * limit)
          .limit(limit)
          .select('_id name'),
        this.categoryModule.find({})
      ])
      return {
        Categorys,
        totalDocument: totalDocument.length || 0,
        totalPage: Math.ceil(totalDocument.length / limit) || 0,
        limit: Number(limit),
        page: Number(page)
      }
    } catch (err) {
      throw new BadRequestException(err.message)
    }
  }

  async findOne(id: string) {
    const category = await this.categoryModule.findById(id)
    if (!category) {
      throw new HttpException(messageRespone.CATEGORY_NOT_EXITS, HttpStatus.NOT_FOUND)
    }
    return category
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return await this.categoryModule.updateOne({ ...updateCategoryDto })
  }

  async remove(id: string, user: Payload) {
    try {
      await this.categoryModule.updateOne(
        { _id: id },
        {
          deleteBy: {
            _id: user.user_id,
            name: user.name
          }
        }
      )
      return await this.categoryModule.softDelete({ _id: id })
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.UNAUTHORIZED)
    }
  }
}
