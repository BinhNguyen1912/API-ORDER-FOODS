import { Module } from '@nestjs/common'
import { FilesService } from './files.service'
import { FilesController } from './files.controller'
import { MulterModule } from '@nestjs/platform-express'
import { MulterConfigOption } from './files.config'
import { MongooseModule } from '@nestjs/mongoose'
import { File, FileSchema } from './Schema/file.schema'

@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: MulterConfigOption
    }),
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }])
  ],
  controllers: [FilesController],
  providers: [FilesService]
})
export class FilesModule {}
