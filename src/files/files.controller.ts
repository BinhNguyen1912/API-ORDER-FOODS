import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  UploadedFiles
} from '@nestjs/common'
import { FilesService } from './files.service'
import { CreateFileDto } from './dto/create-file.dto'
import { UpdateFileDto } from './dto/update-file.dto'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { DecodeToken, Public, ResponeMessage } from 'src/Decorators/Customs'
import { Payload } from 'src/auth/auth.interface'
import { messageRespone } from 'src/common/Message'
import { Express } from 'express'

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @ResponeMessage(messageRespone.UPLOAD_IMAGE_SUCCESS)
  @UseInterceptors(FileInterceptor('file'))
  async create(@UploadedFile() file: Express.Multer.File, @DecodeToken() user: Payload) {
    return await this.filesService.ProcessImage(file, user)
  }
  @Post('UploadManyImage')
  @ResponeMessage(messageRespone.UPLOAD_IMAGE_SUCCESS)
  @UseInterceptors(FilesInterceptor('files'))
  async createManyImage(@UploadedFiles() files: Array<Express.Multer.File>, @DecodeToken() user: Payload) {
    return files
  }
  @Public()
  @ResponeMessage(messageRespone.GET_IMAGE_SUCCESS)
  @Get(':imageId')
  async findOne(@Param('imageId') id: string, @Res() res: Response) {
    return await this.filesService.findOne(id, res)
  }
}
