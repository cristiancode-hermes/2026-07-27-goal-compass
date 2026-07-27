import { IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCycleDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;
}
