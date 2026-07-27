import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateKeyResultDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ enum: ['percentage', 'number', 'currency', 'binary'] })
  @IsString()
  @IsEnum(['percentage', 'number', 'currency', 'binary'])
  type: 'percentage' | 'number' | 'currency' | 'binary';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty()
  @IsNumber()
  startValue: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  targetValue: number;

  @ApiProperty()
  @IsString()
  objectiveId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerId?: string;
}
