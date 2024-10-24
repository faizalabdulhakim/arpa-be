import { Role } from '@prisma/client';

export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  role: Role;
}
