import { z } from "zod";


export class OrderValidation {
    static readonly CREATE = z.object({
        code:z.string(),
        user_id:z.string(),
        shipping_address_id:z.string(),
        status:z.enum(["CREATED","PAID","FAILED","SHIPPED","DELIVERED","CANCELLED"]),
        subtotal:z.number(),
        shipping_cost:z.number(),
        discount_total:z.number(),
        grand_total:z.number(),
    });

    static readonly UPDATE = z.object({
        id:z.string(),
        code:z.maxLength(200),
        user_id:z.string(),
        shipping_address_id:z.string(),
        status:z.enum(["CREATED","PAID","FAILED","SHIPPED","DELIVERED","CANCELLED"]),
        subtotal:z.number(),
        shipping_cost:z.number(),
        discount_total:z.number(),
        grand_total:z.number(),
    });
}


export class OrderItemValidation {
    static readonly CREATE = z.object({
        address_id:z.string(),
        book_id:z.string(),
        qty:z.number(),
    });

    static readonly UPDATE = z.object({
        id:z.string(),
        book_id:z.string(),
        qty:z.number(),
        address_id:z.string(),
    });
    
    static readonly SEARCH=z.object({
        page:z.number().min(1).positive(),
        size:z.number().min(1).positive(),
        status:z.enum(["CREATED","PAID","FAILED","SHIPPED","DELIVERED","CANCELLED"]).optional(),
        orderBy:z.enum(['asc','desc']).optional(),
    });
}
