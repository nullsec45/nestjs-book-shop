import { z } from "zod";

export class BookCategoryValidation {
    static readonly CREATE = z.object({
        book_id:z.string(),
        category_id:z.string(),
        ord: z.number().optional(),
    });

    static readonly UPDATE = z.object({
        id:z.string(),
        book_id:z.string(),
        category_id:z.string(),
    });
}
