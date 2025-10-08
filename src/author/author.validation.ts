// src/auth/user.validation.ts
import { z } from "zod";

export class AuthorValidation {
    static readonly CREATE = z.object({
        name:z.string().min(5).max(200),
        slug:z.string().min(5).max(220),
        bio: z.string().min(20).max(350).optional(),
    });

    static readonly UPDATE = z.object({
        id:z.string(),
        name:z.string().min(5).max(200),
        slug:z.string().min(5).max(220),
        bio: z.string().min(20).max(350).optional(),
    });

    static readonly SEARCH=z.object({
        name:z.string().min(2).optional(),
        email:z.string().min(2).optional(),
        phone:z.string().min(2).optional(),
        page:z.number().min(1).positive(),
        size:z.number().min(1).max(100).positive()
    });
}
