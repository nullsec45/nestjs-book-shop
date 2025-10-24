// src/auth/user.validation.ts
import { z } from "zod";

export class BookValidation {
    static readonly CREATE = z.object({
        title:z.string().min(5).max(200),
        isbn:z.string().min(13).max(15),
        slug:z.string().min(5).max(220),
        description: z.string().min(20).max(350).optional(),
        price:z.number().refine(
            (val) => Number.isFinite(val) && /^\d+\.\d{2}$/.test(val.toFixed(2)),
            {
            message: "Must have exactly 2 decimal places",
            }
        ),
        pages:z.number().positive(),
        language:z.string(),
        publisher:z.string(),
        published_at: z.coerce.date(),
        stock_cached:z.number().positive()
    });

    static readonly UPDATE = z.object({
        id:z.string(),
        title:z.string().min(5).max(200),
        isbn:z.string().min(13).max(15),
        slug:z.string().min(5).max(220),
        description: z.string().min(20).max(350).optional(),
        price:z.number().refine(
            (val) => Number.isFinite(val) && /^\d+\.\d{2}$/.test(val.toFixed(2)),
            {
            message: "Must have exactly 2 decimal places",
            }
        ),
        pages:z.number().positive(),
        language:z.string(),
        publisher:z.string(),
        published_at:z.coerce.date(),
        stock_cached:z.number().positive()
    });

    static readonly SEARCH=z.object({
        title:z.string().min(2).optional(),
        page:z.number().min(1).positive(),
        size:z.number().min(1).positive()
    });
}
