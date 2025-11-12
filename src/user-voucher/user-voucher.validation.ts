import { z } from "zod";

export class UserVoucherValidation {
    static readonly CREATE = z.object({
        user_id:z.string(),
        voucher_id:z.string(),
        total:z.number(),
    });

    static readonly UPDATE = z.object({
        id:z.string(),
        user_id:z.string(),
        voucher_id:z.string(),
        total:z.number(),
    });

    static readonly SEARCH=z.object({
        page:z.number().min(1).positive(),
        size:z.number().min(1).positive(),
    });
}
