import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateObjectiveDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['committed', 'aspirational'] })
  @IsString()
  @IsEnum(['committed', 'aspirational'])
  type: 'committed' | 'aspirational';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiProperty()
  @IsString()
  teamId: string;

  @ApiProperty()
  @IsString()
  cycleId: string;
}
