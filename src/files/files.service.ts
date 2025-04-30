import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { CreateFileDto } from './dto/create-file.dto'
import { UpdateFileDto } from './dto/update-file.dto'
import { messageRespone } from 'src/common/Message'
import sharp from 'sharp'
import fs from 'fs'
import { InjectModel } from '@nestjs/mongoose'
import { File } from './Schema/file.schema'
import { Model, Types } from 'mongoose'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { Response } from 'express'
import { Payload } from 'src/auth/auth.interface'
import { rimrafSync } from 'rimraf'
@Injectable()
export class FilesService {
  constructor(@InjectModel(File.name) private FileModule: SoftDeleteModel<File>) {}
  async ProcessImage(file: Express.Multer.File, user: Payload) {
    try {
      if (!file) {
        throw new HttpException(messageRespone.NOT_FOUND_FILE, HttpStatus.BAD_REQUEST)
      }

      const buffer: Buffer = await sharp(file.path)
        .resize(800) // Thay đổi kích thước chiều rộng còn 800px
        .jpeg({ quality: 80 }) // Giảm chất lượng xuống còn 80% (giữ định dạng JPEG)
        .toBuffer() //.toBuffer là chuyển ảnh về dạng nhị phân để lưu trữ

      //Xóa file gốc sau khi tối ưu hóa

      // if (fs.existsSync(file.path)) {
      //   await this.deleteFile(file.path)
      // }
      //Sẽ lưu ảnh dưới dạng nhị phân , khi render ra nhớ set thêm content-type
      //qua bên get ảnh để xem
      const _id = new Types.ObjectId(file.filename.split('.')[0])
      const fileDB = await this.FileModule.create({
        _id,
        data: buffer,
        filename: file.filename,
        mimetype: 'image/jpeg',
        user_id: new Types.ObjectId(user.user_id)
      })

      return `http://localhost:5000/api/v1/files/${fileDB.filename}`
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async ProcessManyImage(files: Array<Express.Multer.File>, user: Payload) {
    if (files.length < 0) throw new BadRequestException(messageRespone.NOT_FOUND_FILE)
    const Urlfiles = await Promise.all(
      files.map((item) => {
        return this.ProcessImage(item, user)
      })
    )
    console.log(Urlfiles)
  }
  async deleteFile(path: string): Promise<void> {
    try {
      await rimrafSync(path)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async findOne(id: string, res: Response) {
    try {
      //Lưu ý dữ liệu ảnh sẽ được lưu dưới dạng Binary
      const image = await this.FileModule.findOne({ filename: id })
      if (!image) throw new UnauthorizedException('Image not Found')

      //set lại định dạng ảnh để hiển thị khi sử dụng dưới dạng nhị phân
      res.setHeader('Content-Type', image.mimetype)
      res.send(image.data)
    } catch (error) {
      throw new HttpException('Error retrieving image', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
