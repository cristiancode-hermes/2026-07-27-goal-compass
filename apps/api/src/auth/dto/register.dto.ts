import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;
}
