import { Module } from '@nestjs/common'
import { ConversationService } from './conversation.service'
import { ConversationController } from './conversation.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Conversation, ConversationSchema } from './schema/conversation.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ schema: ConversationSchema, name: Conversation.name, collection: Conversation.name }])
  ],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService]
})
export class ConversationModule {}
