export class CreateVoucherRequest {
  code:string;
  discount:number;
  upper_limit?:number;
  description:string;
  start_date:Date;
  end_date:Date;
}

export class VoucherResponse {
  id:string;
  code:string;
  discount:number;
  upper_limit?:number;
  description:string;
  start_date:Date;
  end_date:Date;
}

export class UpdateVoucherRequest {
   id:string;
   code:string;
   discount:number;
   upper_limit?:number;
   description:string;
   start_date:Date;
   end_date:Date;
}

export class SearchVoucherRequest{
    page:number;
    size:number;
    discount?:number;
    upper_limit?:number;
}