// src/common/validation.service.ts
import { Injectable } from '@nestjs/common';
import { z } from 'zod';

@Injectable()
export class ValidationService {
  validate<S extends z.ZodType<any, any, any>>(
    schema: S,
    data: unknown
  ): z.infer<S> {
    return schema.parse(data);
  }
}
