export type Role = 'ADMIN' | 'CUSTOMER';

export class RegisterUserRequest {
  name:string;
  username:string;
  email: string;
  password: string;
  role: Role;
}

export class UserResponse {
  name:string;
  username:string;
  email: string;
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

