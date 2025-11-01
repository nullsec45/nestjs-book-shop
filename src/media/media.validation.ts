// src/auth/user.validation.ts
import { z } from "zod";

export class MediaValidation {
    static readonly CREATE = z.object({
        parent_id:z.string().optional(),
        collection_name:z.enum(["book_cover","profile_user"]),
        type: z.enum(["book","profile"]),
    });

    static readonly UPDATE = z.object({
        id:z.string(),
        parent_id:z.string().optional(),
        collection_name:z.enum(["book_cover","profile_user"]),
        type: z.enum(["book","profile"]),
    });
}
