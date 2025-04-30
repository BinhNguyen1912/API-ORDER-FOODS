import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common'
import { MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express'
import { existsSync, mkdir, mkdirSync } from 'fs'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { UPLOAD_IMAGE_DIR } from './Dir'
import { getFilename } from './getFileName'
import { Types } from 'mongoose'
export const initFolder = () => {
  ;[UPLOAD_IMAGE_DIR].forEach((dir) => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
  })
}
export class MulterConfigOption implements MulterOptionsFactory {
  getPathRoot() {
    return process.cwd()
  }

  createMulterOptions(): MulterModuleOptions {
    return {
      storage: diskStorage({
        //Xu ly duong dan de luu anh
        destination: UPLOAD_IMAGE_DIR,
        filename: (req, file, cb) => {
          const id = new Types.ObjectId()
          //Lay id ra lam ten anh do luon , sau de lay ra
          const fileName = `${id}.jpeg`
          cb(null, fileName) // Trả về tên file sau khi đã xử lý
        }
      }),
      limits: {
        fileSize: 1024 * 1024 * 4,
        files: 3
      },
      fileFilter(req, file, callback) {
        const allowedMimeTypes = /\/(jpg|jpeg|png|pdf)$/
        if (allowedMimeTypes.test(file.mimetype)) {
          callback(null, true) // Cho phép upload nếu định dạng hợp lệ
        } else {
          callback(
            new HttpException(
              `UnSupported file type ${extname(file.originalname)}. Only jpg, jpeg, png, and pdf are allowed.`,
              HttpStatus.UNPROCESSABLE_ENTITY
            ),
            false
          )
        }
      }
    }
  }
}
