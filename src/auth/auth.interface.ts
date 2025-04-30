import { Types } from 'mongoose'
export enum TokenType {
  access_token,
  refresh_token,
  verify_token
}
export enum verifyType {
  verify,
  unverify
}
export interface Payload {
  user_id: Types.ObjectId
  name: string
  role?: Types.ObjectId
  tokenType?: TokenType
  email: string
  exp?: Date
  phone?: string
}
export interface PayLoadSignToken {
  user_id: Types.ObjectId
  email: string
  tokenType?: TokenType
  exp?: Date
}
