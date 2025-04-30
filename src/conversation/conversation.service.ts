import { Injectable } from '@nestjs/common'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { UpdateConversationDto } from './dto/update-conversation.dto'
import { InjectModel } from '@nestjs/mongoose'
import { users } from 'src/users/Schema/user.schema'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { Conversation } from './schema/conversation.schema'
import aqp from 'api-query-params'
import { Types } from 'mongoose'
@Injectable()
export class ConversationService {
  constructor(@InjectModel(Conversation.name) private conversationModule: SoftDeleteModel<Conversation>) {}
  async create(createConversationDto: CreateConversationDto) {
    const result = await this.conversationModule.create({
      ...createConversationDto,
      sender: new Types.ObjectId(createConversationDto.sender),
      receiver: new Types.ObjectId(createConversationDto.receiver)
    })
    return result
  }

  async getListConversation(page: number, limit: number, sender: string, receiver: string) {
    const match = {
      $or: [
        {
          sender: new Types.ObjectId(sender),
          receiver: new Types.ObjectId(receiver)
        },
        {
          sender: new Types.ObjectId(receiver),
          receiver: new Types.ObjectId(sender)
        }
      ]
    }

    const [messages, totalDocument] = await Promise.all([
      this.conversationModule
        .find(match)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort('createdAt')
        .exec(),
      (await this.conversationModule.find(match)).length
    ])

    return {
      messages,
      totalPage: Math.ceil(totalDocument / limit) || 0,
      totalDocument: totalDocument || 0,
      limit: Number(limit),
      page: Number(page)
    }
  }

  findAll() {
    return `This action returns all conversation`
  }

  findOne(id: number) {
    return `This action returns a #${id} conversation`
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`
  }

  remove(id: number) {
    return `This action removes a #${id} conversation`
  }
}
