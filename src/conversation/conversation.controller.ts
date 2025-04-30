import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpException, HttpStatus } from '@nestjs/common'
import { ConversationService } from './conversation.service'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { UpdateConversationDto } from './dto/update-conversation.dto'
import { DecodeToken } from 'src/Decorators/Customs'
import { Payload } from 'src/auth/auth.interface'

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  async create(@Body() createConversationDto: CreateConversationDto) {
    return await this.conversationService.create(createConversationDto)
  }

  @Get('getListConversation/:receiver')
  async findAll(
    @DecodeToken() user: Payload,
    @Param('receiver') receiver: string,
    @Query('page') page: number,
    @Query('limit') limit: number
  ) {
    try {
      return await this.conversationService.getListConversation(page, limit, user.user_id.toString(), receiver)
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.UNAUTHORIZED)
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConversationDto: UpdateConversationDto) {}

  @Delete(':id')
  remove(@Param('id') id: string) {}
}
