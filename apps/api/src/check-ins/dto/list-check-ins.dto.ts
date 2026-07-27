import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListCheckInsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyResultId?: string;
}
