import { forwardRef, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { baseRepository } from 'src/base.repository'
import { users } from './Schema/user.schema'
import { InjectModel } from '@nestjs/mongoose'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import crypto from 'crypto'
import { ConfigService } from '@nestjs/config'
import { Types } from 'mongoose'
import { Payload, verifyType } from 'src/auth/auth.interface'
import aqp from 'api-query-params'
import { promises } from 'dns'
import { messageRespone } from 'src/common/Message'
import { AuthService } from 'src/auth/auth.service'
// import { Cache } from 'cache-manager'
@Injectable()
export class UsersService extends baseRepository<users> {
  constructor(
    @InjectModel(users.name) private userModule: SoftDeleteModel<users>,
    private configService: ConfigService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) {
    super(userModule)
  }
  async checkMail(email: string): Promise<users> {
    const resuft = await this.userModule.findOne({ email: email })
    return resuft
  }
  async checkCode(code: string, id: string): Promise<users | null> {
    const user: users = await this.userModule.findOne({ _id: new Types.ObjectId(id) })
    if (!user) throw new UnauthorizedException(messageRespone.USER_NOT_FOUND)
    console.log(code)
    console.log('Code Change Password', user.codeVerify)

    if (user.codeVerify.toUpperCase() === code.toUpperCase()) return user
    else throw new UnauthorizedException(messageRespone.Invalid_PIN)
  }

  HassPassword = (password: string) => {
    return crypto
      .createHash('sha256')
      .update(password + this.configService.get<string>('SECET_PASSWORD'))
      .digest('hex')
  }
  async createByUser(createUserDto: CreateUserDto, _id: Types.ObjectId) {
    const { name, password, email, phone, avatar } = createUserDto
    const newAvatar = avatar ? avatar : this.configService.get<string>('IMAGE_TEMP')
    const role_user = new Types.ObjectId(this.configService.get<string>('ID_ROLE_USER'))
    const payload: Payload = {
      email,
      name,
      role: role_user,
      user_id: _id,
      phone
    }
    const verify_token = await this.authService.SignVerifyToken(payload)
    const [access_token, refresh_token] = await this.authService.SignAcess_Refresh(payload)
    const resuft = await this.userModule.create({
      _id,
      email,
      name,
      password: this.HassPassword(password),
      role: role_user,
      phone,
      avatar: newAvatar,
      verify_token,
      verify: verifyType.unverify,
      refresh_token
    })

    return {
      user: {
        _id: resuft._id,
        email,
        phone,
        avatar: newAvatar,
        name
      },
      access_token: access_token
    }
  }
  async createByAdmin(createUserDto: CreateUserDto) {
    const { name, password, role, email, phone, avatar } = createUserDto
    const checkmail = await this.checkMail(email)
    if (checkmail) {
      throw new HttpException('Email exitsed', HttpStatus.UNAUTHORIZED)
    }
    const _id = new Types.ObjectId()
    const user = await this.userModule.create({
      _id,
      email,
      name,
      password: this.HassPassword(password),
      role: role || new Types.ObjectId(this.configService.get<string>('ID_ROLE')),
      phone,
      avatar,
      verify_token: '',
      verify: verifyType.verify,
      createdBy: {
        _id: new Types.ObjectId('670106e1d99ae4b40d7ae0c8'),
        name: 'Admin'
      }
    })
    return user
  }
  async updateRefreshToken(refresh_token: string, id: string) {
    // const user = await this.userModule.findOne({ _id: new Types.ObjectId(id) })
    // console.log('user at Update Refresh ', user)

    return await this.userModule.updateOne(
      { _id: new Types.ObjectId(id) },
      {
        refresh_token
      }
    )
  }

  async findAll(query: string, limit: number, page: number) {
    try {
      const { filter, population, sort, projection } = aqp(query)
      //Delete skip va limit trong filter
      delete filter.page
      // console.log('>>>>>>>Filter : ', filter)
      console.log(filter)

      const [resuft, totalDocument] = await Promise.all([
        this.userModule
          .find(filter)
          .skip((page - 1) * limit)
          .limit(limit)
          .sort(sort as any)
          .populate(population)
          .select(projection)
          .exec(),
        (await this.userModule.find(filter)).length
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
  // async setUserByRedis(user_id: string, users: users) {
  //   return await this.cacheManager.set(user_id, users, 3600)
  // }

  async findOne(id: string) {
    return await this.userModule.findById(new Types.ObjectId(id)).select('-password -refresh_token -verify_token')
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const resuft = await this.userModule.updateOne(
      { _id: new Types.ObjectId(id) },
      {
        ...updateUserDto
      }
    )
    return resuft
  }

  async remove(id: string, user: Payload) {
    try {
      if (user.email == this.configService.get<string>('AdminAccount') || id == '670106e1d99ae4b40d7ae0c8') {
        throw new HttpException(messageRespone.NOT_DELETE_THIS_ACCOUNT, HttpStatus.FORBIDDEN)
      }
      await this.userModule.updateOne(
        { _id: new Types.ObjectId(id) },
        {
          deleteBy: {
            _id: user.user_id,
            name: user.name
          }
        }
      )
      return await this.userModule.softDelete(new Types.ObjectId(id))
    } catch (err) {
      throw new UnauthorizedException(err.message)
    }
  }
  async UpdateVerifyCodeAndToken({ token, id, code }: { token: string; id: string; code: string }) {
    return await this.userModule.updateOne(
      { _id: new Types.ObjectId(id) },
      {
        verify_token: token,
        codeVerify: code
      }
    )
  }
  async changePassword(password: string, id: string) {
    console.log(password)
    console.log(id)

    if (!password) {
      throw new HttpException(messageRespone.PASSWORD_NOT_FOUND_OR_NOT_EMPTY, HttpStatus.UNPROCESSABLE_ENTITY)
    } else
      return await this.userModule.updateOne(
        {
          _id: new Types.ObjectId(id)
        },
        {
          password: this.HassPassword(password)
        }
      )
  }
  async GetUserByRefresh(refresh_token: string): Promise<users> {
    return await this.userModule.findOne({ refresh_token }).select('-password -refresh_token -verify_token')
  }
  async getUserByToken(token: Payload) {
    const user = await this.userModule
      .findOne({ _id: new Types.ObjectId(token.user_id) })
      .select('-password -refresh_token')
    return user
  }
  async getAllIDs() {
    const ids = await this.userModule.find().select('_id')
    console.log(ids)
    return ids
  }
}
