// src/auth/user.validation.ts
import { z } from "zod";

export class UserValidation {
  static readonly REGISTER = z.object({
    name:z.string().min(5).max(255),
    username:z.string().min(5).max(100),
    email: z.email(),
    password: z.string().min(8).max(100),
    role: z.enum(["ADMIN","CUSTOMER"]),
  });

  static readonly LOGIN = z.object({
    email: z.email(),
    password: z.string().min(1),
  });

  static readonly UPDATE = z.object({
    name:z.string().min(5).max(255),
    username:z.string().min(5).max(100),
    email: z.email(),
    password: z.string().min(8).max(100),
    role: z.enum(["ADMIN","CUSTOMER"]),
  });
}
