import { ConfigService } from '@nestjs/config'
import * as CryptoJS from 'crypto-js'
const configService = new ConfigService()
const ENCRYPT_KEY = configService.get<string>('ENCRYPT_KEY')
console.log(ENCRYPT_KEY)

export const encryptData = (data: object): string => {
  // Chuyển object thành chuỗi JSON
  const jsonData = JSON.stringify(data)

  // Mã hóa bằng AES
  const encrypted = CryptoJS.AES.encrypt(jsonData, ENCRYPT_KEY).toString()

  // Chuyển sang Base64 (để an toàn khi truyền qua URL hoặc JSON)
  return btoa(encrypted)
}

export const decryptData = (encryptedData: string): any => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, configService.get<string>('ENCRYPT_KEY')).toString()
  const decrypted = bytes.toString(CryptoJS.enc.Utf8)
  return JSON.parse(decrypted)
}
