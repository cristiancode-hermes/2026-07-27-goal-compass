import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateInitiativeDto } from './create-initiative.dto';

export class UpdateInitiativeDto extends PartialType(CreateInitiativeDto) {
  @ApiPropertyOptional({ enum: ['todo', 'in_progress', 'done'] })
  @IsOptional()
  @IsString()
  @IsEnum(['todo', 'in_progress', 'done'])
  status?: 'todo' | 'in_progress' | 'done';
}
