import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckInsController } from './check-ins.controller';
import { CheckInsService } from './check-ins.service';
import { CheckIn } from '../entities/check-in.entity';
import { KeyResult } from '../entities/key-result.entity';
import { Objective } from '../entities/objective.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CheckIn, KeyResult, Objective])],
  controllers: [CheckInsController],
  providers: [CheckInsService],
  exports: [CheckInsService],
})
export class CheckInsModule {}
