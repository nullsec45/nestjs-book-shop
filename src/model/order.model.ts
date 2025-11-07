export class CreateOrderItemRequest{
    shipping_address_id:string;
    book_id:string;
    qty:number;
}

export class UpdateOrderItemRequest{
    id:string;
    shipping_address_id:string;
    book_id:string;
    qty:number;
}

export class UserSummaryResponse{
    name:string;
}

export class AddressResponse{
    label:string;
    recipient_name:string;
    phone:string;
    line:string;
    city:string;
    province:string;
}

export class OrderSummaryResponse{
    id:string;
    code:string;
    shipping_address_id:string;
    status:string;
    subtotal:number;
    shipping_cost:number;
    discount_total:number;
    grand_total:number;
    user?:UserSummaryResponse;
    address?:AddressResponse;
}

export class BookSummaryResponse{
    id:string;
    slug:string;
    title:string;
    price:number;
}

export class OrderItemResponse{
    id:string;
    order_id:string;
    book_id:string;
    qty:number;
    title_snapshot:string;
    price_snapshot:number;
    added_at:Date;
    line_total?:string | null;
    book?:BookSummaryResponse;
    order?:OrderSummaryResponse;
}

export class SearchOrderItemRequest{
    page:number;
    size:number;
    status:string;
    orderBy:'asc' | 'desc';
}