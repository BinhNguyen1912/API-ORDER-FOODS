import { HttpException, HttpStatus, Inject } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import aqp from 'api-query-params'
import { Document, Types } from 'mongoose'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
export class baseRepository<T extends Document> {
  constructor(@InjectModel('') private module: SoftDeleteModel<T>) {}
  async gopvui() {
    return 'hehe'
  }
  async FindOneByID(id: string) {
    return await this.module.findById(new Types.ObjectId(id))
  }
  async GetList(query: string, limit: number, page: number) {
    try {
      const { filter, population, sort, projection } = aqp(query)
      //Delete skip va limit trong filter
      delete filter.page
      delete filter.limit
      // console.log('>>>>>>>Filter : ', filter)

      const [resuft, totalDocument] = await Promise.all([
        this.module
          .find(filter)
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: 1 })
          .populate(population)
          .select(projection)
          .exec(),
        (await this.module.find(filter)).length
      ])
      return {
        resuft,
        totalPage: Math.ceil(totalDocument / Number(limit)) | 0,
        totalDocument: totalDocument | 0,
        limit: Number(limit),
        page: Number(page)
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.UNAUTHORIZED)
    }
  }
  async GetByCondition(filter, population?: any | null, field?: any | null, option?: any | null): Promise<T[]> {
    try {
      return await this.module.find(filter, filter, option).populate(population)
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.UNAUTHORIZED)
    }
  }
}
