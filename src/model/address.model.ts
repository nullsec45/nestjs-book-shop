export class CreateAddressRequest {
    label:string;
    recipient_name:string;
    phone: string;
    line:string;
    city:string;
    province:string;
    is_default:boolean;
}

export class AddressResponse {
    id:string;
    label:string;
    recipient_name:string;
    phone: string;
    line:string;
    city:string;
    province:string;
    is_default:boolean;
}

export class UpdateAddressRequest {
    id:string;
    label:string;
    recipient_name:string;
    phone: string;
    line:string;
    city:string;
    province:string;
    is_default:boolean;
}


export class SearchAddressRequest{
    title?:string;
    page:number;
    size:number;
}