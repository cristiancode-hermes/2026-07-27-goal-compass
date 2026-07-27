import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListInitiativesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyResultId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assigneeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
