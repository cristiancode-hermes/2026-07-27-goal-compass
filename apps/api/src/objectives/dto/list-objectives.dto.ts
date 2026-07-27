import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListObjectivesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cycleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  teamId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
