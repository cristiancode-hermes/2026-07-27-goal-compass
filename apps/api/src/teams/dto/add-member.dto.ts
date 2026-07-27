import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ enum: ['admin', 'member'] })
  @IsString()
  @IsEnum(['admin', 'member'])
  role: 'admin' | 'member';
}
