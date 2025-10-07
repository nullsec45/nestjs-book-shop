// common/filters/zod-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ZodError } from 'zod';

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    const grouped = exception.issues.reduce<Record<string, string[]>>((acc, i) => {
      const field = (i.path?.[0] as string) ?? 'root';
      (acc[field] ??= []).push(i.message);
      return acc;
    }, {});

    res.status(422).json({
      success: false,
      statusCode: 422,
      message: 'Validation failed',
      errors: grouped,
    });
  }
}
