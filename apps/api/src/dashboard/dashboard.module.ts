import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Cycle } from '../entities/cycle.entity';
import { Objective } from '../entities/objective.entity';
import { KeyResult } from '../entities/key-result.entity';
import { CheckIn } from '../entities/check-in.entity';
import { Initiative } from '../entities/initiative.entity';
import { Team } from '../entities/team.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cycle,
      Objective,
      KeyResult,
      CheckIn,
      Initiative,
      Team,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
