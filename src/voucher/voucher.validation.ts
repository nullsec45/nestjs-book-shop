import { z } from "zod";

export class VoucherValidation {
    static readonly CREATE = z.object({
        code:z.string(),
        discount:z.number().max(100),
        upper_limit:z.number().optional(),
        description:z.string(),
        start_date: z.coerce.date(),
        end_date: z.coerce.date(),
    }).refine(
      (data) => data.end_date >= data.start_date,
      {
        message: "end_date cannot be less than start_date",
        path: ["end_date"],
      }
    );;

    static readonly UPDATE = z.object({
        id:z.string(),
        code:z.string(),
        discount:z.number().max(100),
        upper_limit:z.number().optional(),
        description:z.string(),
        start_date: z.coerce.date(),
        end_date: z.coerce.date(),
    }) .refine(
      (data) => data.end_date >= data.start_date,
      {
        message: "end_date cannot be less than start_date",
        path: ["end_date"],
      }
    );

    static readonly SEARCH=z.object({
        page:z.number().min(1).positive(),
        size:z.number().min(1).positive(),
        discount:z.number().min(100).optional(),
        upper_limit:z.number().optional(),
    });
}
