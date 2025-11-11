import { Module,MiddlewareConsumer } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AuthModule } from '@/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '@/common/common.module';
import { AuthorModule } from '@/author/author.module';
import { CategoryModule } from '@/category/category.module';
import { BookModule } from '@/book/book.module';
import { BookAuthorModule } from '@/book-author/book-author.module';
import { BookCategoryModule } from '@/book-category/book-category.module';
import { AddressModule } from '@/address/address.module';
import { UserModule } from '@/user/user.module';
import { CartModule } from '@/cart/cart.module';
import { OrderModule } from '@/order/order.module';
import { MediaModule } from '@/media/media.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { RequestLoggerMiddleware } from './middleware/logger.middleware';
import { VoucherModule } from './voucher/voucher.module';

@Module({
  imports: [
    AuthModule,
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthorModule,
    CategoryModule,
    BookModule,
    BookAuthorModule,
    BookCategoryModule,
    AddressModule,
    UserModule,
    CartModule,
    OrderModule,
    MediaModule, 
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dir = config.get<string>('PATH_FILE') || 'uploads';
        const rootPath = path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);
        return [
          {
            rootPath,                
            serveRoot: '/uploads/', 
          },
        ];
      },
    }), 
    VoucherModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule {
   configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
