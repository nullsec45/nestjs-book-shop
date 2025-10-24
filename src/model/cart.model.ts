export class CreateCartItemRequest{
    book_id:string;
    qty:number;
    note:string;
}

export class UserSummaryResponse{
    name:string;
}

export class CartSummaryResponse{
    id:string;
    is_active:string;
    user?:UserSummaryResponse;
}

export class BookSummaryResponse{
    id:string;
    slug:string;
    title:string;
    price:number;
}

export class CartItemResponse{
    id:string;
    cart_id:string;
    book_id:string;
    qty:number;
    price_snapshot:number;
    added_at:Date;
    note?:string | null;
    book?:BookSummaryResponse;
    cart?:CartSummaryResponse;
}

export class UpdateCartItemRequest{
    id:string;
    book_id:string;
    qty:number;
    note:string;
}

export class SearchCartItemRequest{
    page:number;
    size:number;
}