import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { Team } from '../entities/team.entity';
import { TeamMember } from '../entities/team-member.entity';
import { Cycle } from '../entities/cycle.entity';
import { Objective } from '../entities/objective.entity';
import { KeyResult } from '../entities/key-result.entity';
import { CheckIn } from '../entities/check-in.entity';
import { Initiative } from '../entities/initiative.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,
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
  ) {}

  async onModuleInit() {
    if (!process.env.SEED_DB) {
      return;
    }

    const existingUsers = await this.userRepository.count();
    if (existingUsers > 0) {
      return; // Already seeded
    }

    console.log('Seeding database...');

    // Create users
    const password = await bcrypt.hash('Demo1234', 10);

    const userData = [
      { name: 'Emily Chen', email: 'emily@acme.com', role: 'admin' as const },
      { name: 'Marcus Johnson', email: 'marcus@acme.com', role: 'admin' as const },
      { name: 'Sarah Kim', email: 'sarah@acme.com', role: 'member' as const },
      { name: 'Alex Rivera', email: 'alex@acme.com', role: 'member' as const },
      { name: 'Jenna Park', email: 'jenna@acme.com', role: 'member' as const },
      { name: 'Tomás Silva', email: 'tomas@acme.com', role: 'member' as const },
      { name: 'Lisa Wong', email: 'lisa@acme.com', role: 'member' as const },
      { name: 'David Park', email: 'david@acme.com', role: 'member' as const },
      { name: 'Rachel Green', email: 'rachel@acme.com', role: 'member' as const },
    ];

    const users: User[] = [];
    for (const data of userData) {
      const user = this.userRepository.create({
        ...data,
        password,
      }) as unknown as User;
      const saved = await this.userRepository.save(user) as unknown as User;
      users.push(saved);
    }

    // Create teams
    const designTeam = await this.teamRepository.save(
      this.teamRepository.create({ name: 'Design Team', description: 'Product design and user experience' }) as unknown as Team,
    ) as unknown as Team;
    const growthTeam = await this.teamRepository.save(
      this.teamRepository.create({ name: 'Growth Team', description: 'User acquisition and revenue growth' }) as unknown as Team,
    ) as unknown as Team;

    // Add team members
    const designMembers = [users[0], users[2], users[3], users[4], users[5]];
    for (const user of designMembers) {
      await this.teamMemberRepository.save(
        this.teamMemberRepository.create({
          teamId: designTeam.id,
          userId: user.id,
          role: user.role === 'admin' ? 'admin' : 'member',
        }) as unknown as TeamMember,
      ) as unknown as TeamMember;
    }

    const growthMembers = [users[1], users[6], users[7], users[8]];
    for (const user of growthMembers) {
      await this.teamMemberRepository.save(
        this.teamMemberRepository.create({
          teamId: growthTeam.id,
          userId: user.id,
          role: user.role === 'admin' ? 'admin' : 'member',
        }) as unknown as TeamMember,
      ) as unknown as TeamMember;
    }

    // Create cycle
    const cycle = await this.cycleRepository.save(
      this.cycleRepository.create({
        name: 'Q3 2026',
        startDate: '2026-07-01',
        endDate: '2026-09-30',
        status: 'active',
      }) as unknown as Cycle,
    ) as unknown as Cycle;

    // Create objectives with key results
    const objectivesData = [
      {
        title: 'Redesign the onboarding experience',
        description: 'Create a seamless onboarding flow that increases user activation',
        type: 'committed' as const,
        ownerId: users[0].id,
        teamId: designTeam.id,
        cycleId: cycle.id,
        keyResults: [
          { title: 'Increase activation rate', type: 'percentage' as const, unit: '%', startValue: 0, targetValue: 80, currentValue: 65, progress: 65 },
          { title: 'Reduce time to first key action', type: 'number' as const, unit: 'seconds', startValue: 120, targetValue: 30, currentValue: 45, progress: 83.33 },
        ],
        checkIns: [
          { krIndex: 0, value: 35, confidence: 3, notes: 'Initial wireframes completed', userId: 0 },
          { krIndex: 0, value: 55, confidence: 4, notes: 'User testing phase 1 shows improvement', userId: 2 },
          { krIndex: 0, value: 65, confidence: 4, notes: 'A/B test results promising', userId: 0 },
          { krIndex: 1, value: 90, confidence: 3, notes: 'Prototype testing shows good results', userId: 3 },
          { krIndex: 1, value: 60, confidence: 4, notes: 'Refined interactions', userId: 2 },
          { krIndex: 1, value: 45, confidence: 5, notes: 'Final implementation on track', userId: 0 },
        ],
      },
      {
        title: 'Improve product performance',
        description: 'Optimize core metrics for speed and reliability',
        type: 'committed' as const,
        ownerId: users[2].id,
        teamId: designTeam.id,
        cycleId: cycle.id,
        keyResults: [
          { title: 'Reduce page load time', type: 'number' as const, unit: 'ms', startValue: 3200, targetValue: 1000, currentValue: 1500, progress: 77.27 },
          { title: 'Achieve 99.9% uptime', type: 'percentage' as const, unit: '%', startValue: 99.0, targetValue: 99.9, currentValue: 99.5, progress: 55.56 },
        ],
        checkIns: [
          { krIndex: 0, value: 2800, confidence: 2, notes: 'Initial audit complete', userId: 0 },
          { krIndex: 0, value: 2000, confidence: 3, notes: 'CDN optimizations applied', userId: 4 },
          { krIndex: 0, value: 1500, confidence: 4, notes: 'Code splitting implemented', userId: 4 },
          { krIndex: 1, value: 99.5, confidence: 4, notes: 'Monitoring setup complete', userId: 5 },
        ],
      },
      {
        title: 'Expand market reach',
        description: 'Grow our user base through targeted campaigns',
        type: 'aspirational' as const,
        ownerId: users[1].id,
        teamId: growthTeam.id,
        cycleId: cycle.id,
        keyResults: [
          { title: 'Acquire 10,000 new users', type: 'number' as const, unit: 'users', startValue: 0, targetValue: 10000, currentValue: 4200, progress: 42 },
          { title: 'Increase weekly active users', type: 'number' as const, unit: 'users', startValue: 5000, targetValue: 15000, currentValue: 8200, progress: 32 },
        ],
        checkIns: [
          { krIndex: 0, value: 1200, confidence: 3, notes: 'Campaign launched', userId: 1 },
          { krIndex: 0, value: 2800, confidence: 3, notes: 'Paid ads showing results', userId: 6 },
          { krIndex: 0, value: 4200, confidence: 4, notes: 'Content marketing driving organic growth', userId: 7 },
          { krIndex: 1, value: 6500, confidence: 3, notes: 'Referral program gaining traction', userId: 6 },
          { krIndex: 1, value: 8200, confidence: 4, notes: 'Retention improving with new features', userId: 8 },
        ],
      },
      {
        title: 'Build design system',
        description: 'Create a comprehensive component library for consistent UI',
        type: 'committed' as const,
        ownerId: users[3].id,
        teamId: designTeam.id,
        cycleId: cycle.id,
        keyResults: [
          { title: 'Components documented', type: 'number' as const, unit: 'components', startValue: 0, targetValue: 50, currentValue: 32, progress: 64 },
          { title: 'Adoption rate across products', type: 'percentage' as const, unit: '%', startValue: 0, targetValue: 80, currentValue: 45, progress: 45 },
        ],
        initiatives: [
          { title: 'Create button component spec', krIndex: 0 },
          { title: 'Build form elements library', krIndex: 0 },
          { title: 'Document accessibility guidelines', krIndex: 1 },
        ],
      },
    ];

    for (const objData of objectivesData) {
      const objective = this.objectiveRepository.create({
        title: objData.title,
        description: objData.description,
        type: objData.type,
        ownerId: objData.ownerId,
        teamId: objData.teamId,
        cycleId: objData.cycleId,
      }) as unknown as Objective;
      const savedObj = await this.objectiveRepository.save(objective) as unknown as Objective;

      const createdKRs: KeyResult[] = [];
      for (let i = 0; i < objData.keyResults.length; i++) {
        const krData = objData.keyResults[i];
        const kr = this.keyResultRepository.create({
          title: krData.title,
          type: krData.type,
          unit: krData.unit,
          startValue: krData.startValue,
          currentValue: krData.currentValue,
          targetValue: krData.targetValue,
          progress: krData.progress,
          objectiveId: savedObj.id,
        }) as unknown as KeyResult;
        const savedKr = await this.keyResultRepository.save(kr) as unknown as KeyResult;
        createdKRs.push(savedKr);
      }

      // Create check-ins
      if (objData.checkIns) {
        for (const ci of objData.checkIns) {
          await this.checkInRepository.save(
            this.checkInRepository.create({
              value: ci.value,
              confidence: ci.confidence,
              notes: ci.notes,
              keyResultId: createdKRs[ci.krIndex].id,
              userId: users[ci.userId].id,
            }) as unknown as CheckIn,
          ) as unknown as CheckIn;
        }
      }

      // Create initiatives
      if (objData.initiatives) {
        for (const init of objData.initiatives) {
          await this.initiativeRepository.save(
            this.initiativeRepository.create({
              title: init.title,
              keyResultId: createdKRs[init.krIndex].id,
              status: 'todo',
            }) as unknown as Initiative,
          ) as unknown as Initiative;
        }
      }
    }

    // Update objective progress based on KR progress
    const allObjectives = await this.objectiveRepository.find({
      relations: { keyResults: true },
    });
    for (const obj of allObjectives) {
      const krs = obj.keyResults || [];
      if (krs.length > 0) {
        const totalProgress = krs.reduce((sum, kr) => sum + Number(kr.progress), 0);
        obj.progress = Math.round((totalProgress / krs.length) * 100) / 100;

        const allCompleted = krs.every((kr) => Number(kr.progress) >= 100);
        const progressVal = Number(obj.progress);
        if (allCompleted) {
          obj.status = 'completed';
        } else if (progressVal >= 70) {
          obj.status = 'on-track';
        } else if (progressVal >= 40) {
          obj.status = 'at-risk';
        } else {
          obj.status = 'behind';
        }

        await this.objectiveRepository.save(obj) as unknown as Objective;
      }
    }

    console.log('Database seeded successfully!');
  }
}
