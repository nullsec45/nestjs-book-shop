export type Role = 'ADMIN' | 'CUSTOMER';

export class RegisterUserRequest {
  name:string;
  username:string;
  email: string;
  password: string;
  role: Role;
}

export class AddressResponse{
  label:string;
  recipient_name:string;
  phone:string;
  line:string;
  city:string;
  province:string;
  is_default:string;
}

export class UserResponse {
  name:string;
  username:string;
  email: string;
  addresses?:AddressResponse[];
}

export class LoginUserRequest {
  email: string;
  password: string;
}

export class UpdateUserRequest {
  name:string;
  username:string;
  email?: string;
}

export class UpdatePasswordRequest{
  current_password:string;
  new_password:string;
  confirm_password:string;
}

