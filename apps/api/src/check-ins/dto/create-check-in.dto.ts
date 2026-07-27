import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCheckInDto {
  @ApiProperty()
  @IsString()
  keyResultId: string;

  @ApiProperty()
  @IsNumber()
  value: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  confidence: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
