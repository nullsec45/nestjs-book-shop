// src/auth/user.validation.ts
import { z } from "zod";

export class AddressValidation {
    static readonly CREATE = z.object({
        user_id:z.string(),
        label:z.string().min(5).max(200),
        recipient_name: z.string().min(5).max(200),
        phone: z.string().min(12).max(25),
        line: z.string(),
        city: z.string().min(5).max(200),
        province:z.string().min(5).max(200),
        is_default:z.boolean()
    });

    static readonly UPDATE = z.object({
        id:z.string(),
        user_id:z.string(),
        label:z.string().min(5).max(200),
        recipient_name: z.string().min(5).max(200),
        phone: z.string().min(12).max(25),
        line: z.string(),
        city: z.string().min(5).max(200),
        province:z.string().min(5).max(200),
        is_default:z.boolean()
    });
}
