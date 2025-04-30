import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { CreateCartDto } from './dto/create-cart.dto'
import { UpdateCartDto } from './dto/update-cart.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Cart } from './Schema/cart.schema'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { Payload } from 'src/auth/auth.interface'
import { isValidObjectId, Types } from 'mongoose'
import path from 'path'
import { baseRepository } from 'src/base.repository'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { OrdersService } from 'src/orders/orders.service'
import { Cron } from '@nestjs/schedule'
import aqp from 'api-query-params'
import { messageRespone } from 'src/common/Message'
import { FoodsService } from 'src/foods/foods.service'
import { DATACart } from 'src/common/FakeData'

@Injectable()
export class CartsService extends baseRepository<Cart> {
  private readonly logger = new Logger()
  @Inject(FoodsService) private foodsService: FoodsService
  constructor(@InjectModel(Cart.name) private CartModule: SoftDeleteModel<Cart>) {
    super(CartModule)
  }
  async create(createCartDto: CreateCartDto, user: Payload) {
    try {
      const { foods } = createCartDto
      console.log('foods', foods)

      const cart: Cart = await this.CartModule.findOne({
        customer_id: new Types.ObjectId(user.user_id),
        isOrder: false
      })
      //Neu da co item trong gio hang va chua order => duoc phep them , xoa , sua
      //Neu da co item trong gio hang va da order => duoc phep them

      if (cart) {
        let foodOfCart = cart.foods
        const isExist = foodOfCart.find((item) => item.foodID == foods.foodID)
        //neu chua ton tai mon an do trong gio hang
        if (isExist) {
          const foodsUpdate = foodOfCart.map((v) => {
            if (v.foodID == foods.foodID) {
              if (foods.quality) v.quality += foods.quality
              else v.quality++
            }
            return v
          })
          foodOfCart = foodsUpdate
        } else {
          foodOfCart.push({
            foodID: foods.foodID,
            quality: foods.quality ? foods.quality : 1
          })
        }
        await this.CartModule.updateOne(
          { customer_id: new Types.ObjectId(user.user_id), isOrder: false },
          {
            foods: foodOfCart
          },
          {
            returnDocument: 'after'
          }
        )
        return cart
      }
      return await this.CartModule.create({
        foods: {
          foodID: foods.foodID,
          quality: foods.quality ? foods.quality : 1
        },
        isOrder: false,
        customer_id: new Types.ObjectId(user.user_id)
      })
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.UNAUTHORIZED)
    }
  }

  async findAll(query: string, limit: number, page: number) {
    try {
      const { filter, population, sort, projection } = aqp(query)
      //Delete skip va limit trong filter
      delete filter.page
      delete filter.limit

      const [resuft, totalDocument] = await Promise.all([
        this.CartModule.find(filter)
          .skip((page - 1) * limit)
          .limit(limit)
          .sort(sort as any)
          .populate({
            path: 'foods.foodID',
            select: 'name price image'
          })
          .select(projection)
          .exec(),
        (await this.CartModule.find(filter)).length
      ])
      return {
        resuft,
        totalPage: Math.ceil(totalDocument / limit) || 0,
        totalDocument: totalDocument || 0,
        limit: Number(limit),
        page: Number(page)
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.UNAUTHORIZED)
    }
  }
  async generage() {
    // const _id: Types.ObjectId = new Types.ObjectId()
    // const Data = DATACart
    // const resuft = await Promise.all(
    //   Data.map(async (item) => {
    //     const _id = new Types.ObjectId()
    //     const resuft = await this.CartModule.create({ ...item, _id })
    //     return resuft
    //   })
    // )
    // console.log(`Created ${resuft.length} Carts`)

    // return resuft
    const reusft = await this.CartModule.updateMany(
      {},
      {
        isOrder: true
      }
    )
    return reusft
  }
  async findOne(customer_id: string) {
    console.log('customer_id', customer_id)

    const cart = await this.CartModule.findOne({
      isOrder: false,
      customer_id: new Types.ObjectId(customer_id)
    }).populate([
      {
        path: 'foods.foodID',
        select: 'name price category image',
        populate: {
          path: 'category', // Populate category từ foodID
          select: 'name' // Lấy trường name từ category
        }
      },
      {
        path: 'customer_id',
        select: 'email name id'
      }
    ])
    if (!cart) {
      throw new HttpException(messageRespone.CART_NOT_FOUND, HttpStatus.NOT_FOUND)
    }
    if (!cart.totalPrice || cart.isModify) {
      let sum = 0
      cart.foods.map((item) => {
        sum += item.quality * (item.foodID as any).price
      })
      cart.totalPrice = sum
      cart.isModify = false
      await cart.save()
      return cart
    }
    return cart
  }
  async FindByCartID(cart_id: string): Promise<Cart> {
    return await this.CartModule.findOne({
      _id: new Types.ObjectId(cart_id),
      isOrder: false
    }).populate([
      {
        path: 'foods.foodID',
        select: 'name price category image',
        populate: {
          path: 'category', // Populate category từ foodID
          select: 'name' // Lấy trường name từ category
        }
      },
      {
        path: 'customer_id',
        select: 'email name id'
      }
    ])
  }
  async update(customer_id: string, quality: number, foodID: string) {
    console.log(customer_id, quality, foodID)

    if (!isValidObjectId(customer_id) || !isValidObjectId(foodID)) {
      throw new HttpException('customer_id and foodID must be type ObjectID', HttpStatus.UNPROCESSABLE_ENTITY)
    }
    const resuft = await this.CartModule.findOneAndUpdate(
      { customer_id: new Types.ObjectId(customer_id), isOrder: false, 'foods.foodID': new Types.ObjectId(foodID) },
      {
        $set: {
          //Cú pháp "foods.$.quality" sẽ cập nhật trường quality của phần tử trong mảng foods có foodID được tìm thấy từ truy vấn
          'foods.$.quality': quality, //tìm theo phần tử gọi là elematch,
          isModify: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    console.log(resuft)

    return resuft
  }

  async remove(customer_id: string, foodIDs: string[]) {
    if (!isValidObjectId(customer_id) || !foodIDs.every((item) => isValidObjectId(item))) {
      throw new HttpException('customer_id and foodID must be type ObjectID', HttpStatus.UNPROCESSABLE_ENTITY)
    }
    const resuft = await this.CartModule.updateOne(
      { customer_id: new Types.ObjectId(customer_id), isOrder: false },
      {
        $pull: {
          foods: {
            foodID: {
              $in: foodIDs.map((item) => new Types.ObjectId(item))
            }
          }
        },
        $set: {
          isModify: true
        }
      }
    )
    return resuft
  }
  async CheckOutCart(cart_id: string) {
    try {
      const cart = await this.FindByCartID(cart_id)
      if (!cart) {
        throw new HttpException(messageRespone.CART_NOT_FOUND, HttpStatus.NOT_FOUND)
      }
      const ids: { _id: Types.ObjectId; quality: number }[] = cart.foods.map((item) => {
        return {
          _id: item.foodID._id,
          quality: item.quality
        }
      })

      return await this.foodsService.UpdateSoldFood(ids)
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST)
    }
  }
}
