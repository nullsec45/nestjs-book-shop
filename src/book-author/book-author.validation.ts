// src/auth/user.validation.ts
import { z } from "zod";

export class BookAuthorValidation {
    static readonly CREATE = z.object({
        book_id:z.string(),
        author_id:z.string(),
        ord: z.number().optional(),
    });

    static readonly UPDATE = z.object({
        id:z.string(),
        book_id:z.string(),
        author_id:z.string(),
        ord: z.number().optional(),
    });

    // static readonly SEARCH=z.object({
    //     author:z.string().optional(),
    //     name:z.string().min(2).optional(),
    //     page:z.number().min(1).positive(),
    //     size:z.number().min(1).max(100).positive()
    // });
}
