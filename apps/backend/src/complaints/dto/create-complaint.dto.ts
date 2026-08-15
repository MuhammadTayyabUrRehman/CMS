import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Category, ContactMethod } from '@prisma/client';

export class CreateComplaintDto {
  @IsEnum(Category, { message: 'Category is invalid.' })
  @IsNotEmpty({ message: 'Category is required.' })
  category!: Category;

  @IsString({ message: 'Room number is required.' })
  @IsNotEmpty({ message: 'Room number is required.' })
  @MaxLength(15, { message: 'Room number must be at most 15 characters.' })
  roomNo!: string;

  @IsString({ message: 'Block is required.' })
  @IsNotEmpty({ message: 'Block is required.' })
  @MaxLength(5, { message: 'Block must be at most 5 characters.' })
  block!: string;

  @Type(() => Number)
  @IsInt({ message: 'Rank must be an integer.' })
  @Min(1, { message: 'Rank must be greater than 0.' })
  @Max(30, { message: 'Rank must be at most 30.' })
  rank!: number;

  @IsEnum(ContactMethod, { message: 'Contact method is invalid.' })
  @IsNotEmpty({ message: 'Contact method is required.' })
  contactMethod!: ContactMethod;

  @IsString({ message: 'Contact number is required.' })
  @IsNotEmpty({ message: 'Contact number is required.' })
  @Matches(/^[0-9+()-]+$/, { message: 'Contact number contains invalid characters.' })
  @MaxLength(20, { message: 'Contact number must be at most 20 characters.' })
  contactNumber!: string;

  @IsString({ message: 'Description is required.' })
  @IsNotEmpty({ message: 'Description is required.' })
  @MinLength(10, { message: 'Description must be at least 10 characters.' })
  @MaxLength(4000, { message: 'Description must be at most 4000 characters.' })
  description!: string;
}
