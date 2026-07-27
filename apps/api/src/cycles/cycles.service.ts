import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cycle } from '../entities/cycle.entity';
import { Objective } from '../entities/objective.entity';
import { KeyResult } from '../entities/key-result.entity';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { UpdateCycleDto } from './dto/update-cycle.dto';

@Injectable()
export class CyclesService {
  constructor(
    @InjectRepository(Cycle)
    private cycleRepository: Repository<Cycle>,
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,
    @InjectRepository(KeyResult)
    private keyResultRepository: Repository<KeyResult>,
  ) {}

  async findAll() {
    return this.cycleRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getCurrent() {
    const cycle = await this.cycleRepository.findOne({
      where: { status: 'active' },
      relations: { objectives: { keyResults: true, team: true, owner: true } },
    });
    return cycle;
  }

  async create(dto: CreateCycleDto) {
    const cycle = this.cycleRepository.create({
      name: dto.name,
      startDate: dto.startDate,
      endDate: dto.endDate,
    }) as unknown as Cycle;
    return this.cycleRepository.save(cycle) as unknown as Cycle;
  }

  async findOne(id: string) {
    const cycle = await this.cycleRepository.findOne({
      where: { id },
      relations: {
        objectives: { keyResults: true, team: true, owner: true },
      },
    });
    if (!cycle) {
      throw new NotFoundException('Cycle not found');
    }
    return cycle;
  }

  async update(id: string, dto: UpdateCycleDto) {
    const cycle = await this.cycleRepository.findOne({ where: { id } });
    if (!cycle) {
      throw new NotFoundException('Cycle not found');
    }

    if (dto.name !== undefined) cycle.name = dto.name;
    if (dto.startDate !== undefined) cycle.startDate = dto.startDate;
    if (dto.endDate !== undefined) cycle.endDate = dto.endDate;

    return this.cycleRepository.save(cycle) as unknown as Cycle;
  }

  async remove(id: string) {
    const cycle = await this.cycleRepository.findOne({ where: { id } });
    if (!cycle) {
      throw new NotFoundException('Cycle not found');
    }
    await this.cycleRepository.remove(cycle);
    return { message: 'Cycle deleted' };
  }

  async activate(id: string) {
    const cycle = await this.cycleRepository.findOne({
      where: { id },
      relations: { objectives: true },
    });
    if (!cycle) {
      throw new NotFoundException('Cycle not found');
    }
    if (cycle.status !== 'draft') {
      throw new BadRequestException('Only draft cycles can be activated');
    }
    if (!cycle.objectives || cycle.objectives.length === 0) {
      throw new BadRequestException(
        'Cycle must have at least 1 objective to be activated',
      );
    }

    cycle.status = 'active';
    return this.cycleRepository.save(cycle) as unknown as Cycle;
  }

  async close(id: string) {
    const cycle = await this.cycleRepository.findOne({
      where: { id },
      relations: { objectives: { keyResults: true } },
    });
    if (!cycle) {
      throw new NotFoundException('Cycle not found');
    }
    if (cycle.status !== 'active') {
      throw new BadRequestException('Only active cycles can be closed');
    }

    cycle.status = 'closed';
    return this.cycleRepository.save(cycle) as unknown as Cycle;
  }

  async getSummary(id: string) {
    const cycle = await this.cycleRepository.findOne({
      where: { id, status: 'closed' },
      relations: {
        objectives: { keyResults: true, team: true, owner: true },
      },
    });
    if (!cycle) {
      throw new NotFoundException('Closed cycle not found');
    }

    const objectives = cycle.objectives || [];
    const totalObjectives = objectives.length;
    const completedObjectives = objectives.filter(
      (o) => o.status === 'completed',
    ).length;
    const avgProgress =
      totalObjectives > 0
        ? objectives.reduce((sum, o) => sum + Number(o.progress), 0) /
          totalObjectives
        : 0;

    let totalKeyResults = 0;
    let completedKeyResults = 0;
    for (const obj of objectives) {
      const krs = obj.keyResults || [];
      totalKeyResults += krs.length;
      completedKeyResults += krs.filter((kr) => Number(kr.progress) >= 100).length;
    }

    return {
      cycle: { id: cycle.id, name: cycle.name },
      totalObjectives,
      completedObjectives,
      avgProgress: Math.round(avgProgress * 100) / 100,
      totalKeyResults,
      completedKeyResults,
      objectives,
    };
  }
}
