import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CyclesController } from './cycles.controller';
import { CyclesService } from './cycles.service';
import { Cycle } from '../entities/cycle.entity';
import { Objective } from '../entities/objective.entity';
import { KeyResult } from '../entities/key-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cycle, Objective, KeyResult])],
  controllers: [CyclesController],
  providers: [CyclesService],
  exports: [CyclesService],
})
export class CyclesModule {}
