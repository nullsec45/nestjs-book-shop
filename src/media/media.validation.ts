// src/auth/user.validation.ts
import { z } from "zod";

export class MediaValidation {
    static readonly CREATE = z.object({
        parent_id:z.string(),
        collection_name:z.string(),
        type: z.enum(["book"]),
    });

    static readonly UPDATE = z.object({
        id:z.string(),
        parent_id:z.string(),
        collection_name:z.string(),
        type: z.enum(["book"]),
    });
}
