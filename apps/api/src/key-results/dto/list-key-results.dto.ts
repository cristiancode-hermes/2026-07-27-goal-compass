import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListKeyResultsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  objectiveId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerId?: string;
}
