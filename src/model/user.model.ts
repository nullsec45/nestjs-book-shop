export type Role = 'ADMIN' | 'CUSTOMER';

export class RegisterUserRequest {
  name:string;
  username:string;
  email: string;
  password: string;
  role: Role;
}

export class UserResponse {
  email: string;
  role?: Role;
  token?: string;
}

export class LoginUserRequest {
  email: string;
  password: string;
}

export class UpdateUserRequest {
name:string;
  username:string;
  email?: string;
  password?: string;
  role?: Role;
}
