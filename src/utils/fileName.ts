import { randomBytes } from "crypto";
import { extname } from "path";

export const randomFileName=(originalName: string, len = 16): string => {
    const ext = extname(originalName ?? "").toLowerCase(); 
    const id = randomBytes(len).toString("base64url").slice(0, len);
    return `${Date.now()}-${id}${ext}`;
}
