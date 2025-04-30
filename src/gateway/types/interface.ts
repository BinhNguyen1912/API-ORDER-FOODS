import { Types } from 'mongoose'
export interface ConversationType {
  content: string
  sender: string
  receiver: string
  _id: Types.ObjectId
}
