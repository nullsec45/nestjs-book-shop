export class CreateUserVoucherRequest {
  user_id:string;
  voucher_id:string;
  total:number;
}

export class UserVoucherResponse {
  id:string;
  user_id:string;
  voucher_id:string;
  total:number;
}

export class UpdateUserVoucherRequest {
   id:string;
   user_id:string;
   voucher_id:string;
   total:number;
}

export class SearchUserVoucherRequest{
    page:number;
    size:number;
}