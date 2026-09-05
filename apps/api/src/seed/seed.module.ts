import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../entities/user.entity';
import { Team } from '../entities/team.entity';
import { TeamMember } from '../entities/team-member.entity';
import { Cycle } from '../entities/cycle.entity';
import { Objective } from '../entities/objective.entity';
import { KeyResult } from '../entities/key-result.entity';
import { CheckIn } from '../entities/check-in.entity';
import { Initiative } from '../entities/initiative.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Team, TeamMember, Cycle, Objective, KeyResult, CheckIn, Initiative]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
