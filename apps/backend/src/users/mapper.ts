import { User } from '@prisma/client';
import { UserResponseDto } from './dto';

export function toUserResponseDto(user: User): UserResponseDto {
  const { password, ...rest } = user;
  void password;
  return rest;
}
