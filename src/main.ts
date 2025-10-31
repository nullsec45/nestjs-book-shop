import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from "express-session";
import * as passport from "passport";
import { ZodExceptionFilter } from './common/filters/zod-exception.filter';
import 'dotenv/config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(process.env.PREFIX_VERSION);


  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000
      }
    })
  )

  app.use(passport.initialize());
  app.use(passport.session());
  app.useGlobalFilters(new ZodExceptionFilter());


  await app.listen(3000);
}
bootstrap();
