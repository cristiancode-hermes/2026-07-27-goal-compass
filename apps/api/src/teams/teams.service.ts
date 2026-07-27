import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../entities/team.entity';
import { TeamMember } from '../entities/team-member.entity';
import { User } from '../entities/user.entity';
import { Objective } from '../entities/objective.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,
  ) {}

  async findAll() {
    const teams = await this.teamRepository.find({
      relations: { teamMembers: true, objectives: true },
    });

    return teams.map((team) => {
      const memberCount = team.teamMembers?.length || 0;
      const objectives = team.objectives || [];
      const objectiveCount = objectives.length;
      const avgProgress =
        objectiveCount > 0
          ? objectives.reduce((sum, o) => sum + Number(o.progress), 0) /
            objectiveCount
          : 0;

      return {
        id: team.id,
        name: team.name,
        description: team.description,
        memberCount,
        objectiveCount,
        avgProgress: Math.round(avgProgress * 100) / 100,
        createdAt: team.createdAt,
      };
    });
  }

  async create(dto: CreateTeamDto, userId: string) {
    const team = this.teamRepository.create({
      name: dto.name,
      description: dto.description,
    }) as unknown as Team;
    const saved = await this.teamRepository.save(team) as unknown as Team;

    const member = this.teamMemberRepository.create({
      teamId: saved.id,
      userId,
      role: 'admin',
    }) as unknown as TeamMember;
    await this.teamMemberRepository.save(member) as unknown as TeamMember;

    return this.findOne(saved.id);
  }

  async findOne(id: string) {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: {
        teamMembers: { user: true },
      },
    });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  async update(id: string, dto: UpdateTeamDto) {
    const team = await this.teamRepository.findOne({ where: { id } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (dto.name !== undefined) team.name = dto.name;
    if (dto.description !== undefined) team.description = dto.description;

    await this.teamRepository.save(team) as unknown as Team;
    return this.findOne(id);
  }

  async remove(id: string) {
    const team = await this.teamRepository.findOne({ where: { id } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    await this.teamRepository.remove(team);
    return { message: 'Team deleted' };
  }

  async addMember(teamId: string, dto: AddMemberDto) {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const existing = await this.teamMemberRepository.findOne({
      where: { teamId, userId: dto.userId },
    });
    if (existing) {
      throw new BadRequestException('User is already a member of this team');
    }

    const member = this.teamMemberRepository.create({
      teamId,
      userId: dto.userId,
      role: dto.role,
    }) as unknown as TeamMember;
    await this.teamMemberRepository.save(member) as unknown as TeamMember;

    return { message: 'Member added' };
  }

  async removeMember(teamId: string, userId: string) {
    const member = await this.teamMemberRepository.findOne({
      where: { teamId, userId },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const adminCount = await this.teamMemberRepository.count({
      where: { teamId, role: 'admin' },
    });

    if (adminCount <= 1 && member.role === 'admin') {
      throw new BadRequestException(
        'Cannot remove the last admin from the team',
      );
    }

    await this.teamMemberRepository.remove(member);
    return { message: 'Member removed' };
  }

  async getObjectives(teamId: string) {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return this.objectiveRepository.find({
      where: { teamId },
      relations: { keyResults: true, owner: true, cycle: true },
    });
  }
}
