import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Objective } from '../entities/objective.entity';
import { KeyResult } from '../entities/key-result.entity';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { ListObjectivesDto } from './dto/list-objectives.dto';

@Injectable()
export class ObjectivesService {
  constructor(
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,
    @InjectRepository(KeyResult)
    private keyResultRepository: Repository<KeyResult>,
  ) {}

  async findAll(query: ListObjectivesDto) {
    const where: any = {};

    if (query.cycleId) where.cycleId = query.cycleId;
    if (query.teamId) where.teamId = query.teamId;
    if (query.ownerId) where.ownerId = query.ownerId;
    if (query.status) where.status = query.status;

    const qb = this.objectiveRepository.createQueryBuilder('objective')
      .leftJoinAndSelect('objective.cycle', 'cycle')
      .leftJoinAndSelect('objective.team', 'team')
      .leftJoinAndSelect('objective.owner', 'owner')
      .leftJoinAndSelect('objective.keyResults', 'keyResults');

    if (query.cycleId) qb.andWhere('objective.cycleId = :cycleId', { cycleId: query.cycleId });
    if (query.teamId) qb.andWhere('objective.teamId = :teamId', { teamId: query.teamId });
    if (query.ownerId) qb.andWhere('objective.ownerId = :ownerId', { ownerId: query.ownerId });
    if (query.status) qb.andWhere('objective.status = :status', { status: query.status });
    if (query.search) {
      qb.andWhere('objective.title LIKE :search', { search: `%${query.search}%` });
    }

    return qb.getMany();
  }

  async create(dto: CreateObjectiveDto) {
    const objective = this.objectiveRepository.create({
      title: dto.title,
      description: dto.description,
      type: dto.type,
      ownerId: dto.ownerId,
      teamId: dto.teamId,
      cycleId: dto.cycleId,
    }) as unknown as Objective;
    const saved = await this.objectiveRepository.save(objective) as unknown as Objective;
    return this.findOne(saved.id);
  }

  async findOne(id: string) {
    const objective = await this.objectiveRepository.findOne({
      where: { id },
      relations: {
        keyResults: true,
        cycle: true,
        team: true,
        owner: true,
      },
    });
    if (!objective) {
      throw new NotFoundException('Objective not found');
    }
    return objective;
  }

  async update(id: string, dto: UpdateObjectiveDto) {
    const objective = await this.objectiveRepository.findOne({
      where: { id },
    });
    if (!objective) {
      throw new NotFoundException('Objective not found');
    }

    if (dto.title !== undefined) objective.title = dto.title;
    if (dto.description !== undefined) objective.description = dto.description;
    if (dto.type !== undefined) objective.type = dto.type;
    if (dto.ownerId !== undefined) objective.ownerId = dto.ownerId;
    if (dto.teamId !== undefined) objective.teamId = dto.teamId;
    if (dto.cycleId !== undefined) objective.cycleId = dto.cycleId;

    await this.objectiveRepository.save(objective) as unknown as Objective;
    return this.findOne(id);
  }

  async remove(id: string) {
    const objective = await this.objectiveRepository.findOne({
      where: { id },
      relations: { keyResults: true },
    });
    if (!objective) {
      throw new NotFoundException('Objective not found');
    }

    // Cascade delete key results
    if (objective.keyResults && objective.keyResults.length > 0) {
      await this.keyResultRepository.remove(objective.keyResults);
    }

    await this.objectiveRepository.remove(objective);
    return { message: 'Objective deleted' };
  }
}
