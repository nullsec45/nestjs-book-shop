// src/auth/user.validation.ts
import { z } from "zod";

export class UserValidation {
  static readonly UPDATE_PASSWORD = z.object({
    current_password:z.string(),
    new_password:z.string(),
    confirm_password: z.string(),
  }).refine((data) => data.new_password === data.confirm_password, {
      message:"Password do not match.",
      path:['confirm_password']
  });

  static readonly UPDATE = z.object({
      name:z.string().min(5).max(200),
      username:z.string().min(5).max(150),
      email: z.email(),
  });
}
