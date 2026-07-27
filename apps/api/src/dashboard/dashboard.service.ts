import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cycle } from '../entities/cycle.entity';
import { Objective } from '../entities/objective.entity';
import { KeyResult } from '../entities/key-result.entity';
import { CheckIn } from '../entities/check-in.entity';
import { Initiative } from '../entities/initiative.entity';
import { Team } from '../entities/team.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Cycle)
    private cycleRepository: Repository<Cycle>,
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,
    @InjectRepository(KeyResult)
    private keyResultRepository: Repository<KeyResult>,
    @InjectRepository(CheckIn)
    private checkInRepository: Repository<CheckIn>,
    @InjectRepository(Initiative)
    private initiativeRepository: Repository<Initiative>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  async getDashboard() {
    // Find active cycle
    const activeCycle = await this.cycleRepository.findOne({
      where: { status: 'active' },
    });

    let objectiveCounts = { total: 0, completed: 0, atRisk: 0, behind: 0, onTrack: 0 };
    let overallProgress = 0;
    let krStats = { total: 0, completed: 0 };
    let recentCheckIns: any[] = [];
    let teamProgress: any[] = [];
    let initiativesSummary = { total: 0, todo: 0, inProgress: 0, done: 0 };

    if (activeCycle) {
      // Objective counts
      const objectives = await this.objectiveRepository.find({
        where: { cycleId: activeCycle.id },
        relations: { keyResults: true, team: true, owner: true },
      });

      objectiveCounts = {
        total: objectives.length,
        completed: objectives.filter((o) => o.status === 'completed').length,
        atRisk: objectives.filter((o) => o.status === 'at-risk').length,
        behind: objectives.filter((o) => o.status === 'behind').length,
        onTrack: objectives.filter((o) => o.status === 'on-track').length,
      };

      overallProgress =
        objectives.length > 0
          ? objectives.reduce((sum, o) => sum + Number(o.progress), 0) /
            objectives.length
          : 0;

      // Key result stats
      const allKRs = await this.keyResultRepository.find({
        where: objectives.map((o) => ({ objectiveId: o.id })),
      });
      krStats = {
        total: allKRs.length,
        completed: allKRs.filter((kr) => Number(kr.progress) >= 100).length,
      };

      // Recent check-ins
      recentCheckIns = await this.checkInRepository.find({
        relations: { user: true, keyResult: true },
        order: { createdAt: 'DESC' },
        take: 10,
      });

      // Initiative summary
      const allInitiatives = await this.initiativeRepository.find({
        where: allKRs.map((kr) => ({ keyResultId: kr.id })),
      });
      initiativesSummary = {
        total: allInitiatives.length,
        todo: allInitiatives.filter((i) => i.status === 'todo').length,
        inProgress: allInitiatives.filter((i) => i.status === 'in_progress').length,
        done: allInitiatives.filter((i) => i.status === 'done').length,
      };

      // Team progress
      const teams = await this.teamRepository.find();
      teamProgress = await Promise.all(
        teams.map(async (team) => {
          const teamObjectives = objectives.filter(
            (o) => o.teamId === team.id,
          );
          const avgProgress =
            teamObjectives.length > 0
              ? teamObjectives.reduce((sum, o) => sum + Number(o.progress), 0) /
                teamObjectives.length
              : 0;
          return {
            teamId: team.id,
            teamName: team.name,
            objectiveCount: teamObjectives.length,
            avgProgress: Math.round(avgProgress * 100) / 100,
          };
        }),
      );
    }

    return {
      activeCycle: activeCycle
        ? { id: activeCycle.id, name: activeCycle.name }
        : null,
      objectives: objectiveCounts,
      overallProgress: Math.round(overallProgress * 100) / 100,
      keyResults: krStats,
      recentCheckIns,
      initiatives: initiativesSummary,
      teamProgress,
    };
  }
}
