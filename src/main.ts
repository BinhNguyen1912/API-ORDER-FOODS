import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { JwtAuthGuard } from './auth/Jwt.Guard'
import { TransformerInterceptor } from './Core/tranfromerData'
import { CheckID } from './Core/Guard'
import { join } from 'path'
import { NestExpressApplication } from '@nestjs/platform-express'
import { initFolder } from './files/files.config'
import cookieParser from 'cookie-parser'
import hbs from 'hbs'
import helmet from 'helmet'
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT')
  const reflector = app.get(Reflector)

  //Sử dụng cho việc khởi tạo folder tránh lỗi
  initFolder()
  app.useStaticAssets(join(__dirname, '..', 'public'))
  app.setBaseViewsDir(join(__dirname, '..', 'views'))
  app.setViewEngine('jade')

  //Su dung helmet de bao ve ung dung
  app.use(helmet())

  //Su dung cors
  const hostsArray = configService.get<string>('LIST_CORS')

  const arrayCors = hostsArray.split(',')
  console.log(arrayCors)

  app.enableCors({
    origin: '*'
  })

  //Đăng ký 1 hbs helper để giúp việc tăng số lượng món theo thứ tự
  hbs.registerHelper('inc', (value) => {
    return value + 1
  })

  //khai bao validator (class-validator va classs-transformer)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true
    })
  )
  //Khai bao jwt for all enpoint
  //Dựa vào lệnh này , mọi Request sẽ được nhảy vào jwt.Guard để mà check các điều kiện của mình
  app.useGlobalGuards(new JwtAuthGuard(reflector))

  //Khai bao Interceptor
  app.useGlobalInterceptors(new TransformerInterceptor(reflector))

  //Khai bao su dung (lay ra hoac them vao) Cookies
  app.use(cookieParser())

  //Khai bao version cho ca ung dung
  //vi du http://localhost:5000/api/v1/...
  app.setGlobalPrefix('api')
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  })

  await app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${port}`)
  })
}
bootstrap()
