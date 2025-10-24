import { z } from "zod";

export class CartItemValidation {
    static readonly CREATE = z.object({
        book_id:z.string(),
        qty:z.number(),
        note:z.string(),        
    });

    static readonly UPDATE = z.object({
        id:z.string(),
        book_id:z.string(),
        qty:z.number(),
        note:z.string(), 
    });
    
    static readonly SEARCH=z.object({
        page:z.number().min(1).positive(),
        size:z.number().min(1).positive()
    });
}
