import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Initiative } from '../entities/initiative.entity';
import { KeyResult } from '../entities/key-result.entity';
import { CreateInitiativeDto } from './dto/create-initiative.dto';
import { UpdateInitiativeDto } from './dto/update-initiative.dto';
import { ListInitiativesDto } from './dto/list-initiatives.dto';

@Injectable()
export class InitiativesService {
  constructor(
    @InjectRepository(Initiative)
    private initiativeRepository: Repository<Initiative>,
    @InjectRepository(KeyResult)
    private keyResultRepository: Repository<KeyResult>,
  ) {}

  async findAll(query: ListInitiativesDto) {
    const where: any = {};
    if (query.keyResultId) where.keyResultId = query.keyResultId;
    if (query.assigneeId) where.assigneeId = query.assigneeId;
    if (query.status) where.status = query.status;

    return this.initiativeRepository.find({
      where,
      relations: { keyResult: true, assignee: true },
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateInitiativeDto) {
    const kr = await this.keyResultRepository.findOne({
      where: { id: dto.keyResultId },
    });
    if (!kr) {
      throw new NotFoundException('Key result not found');
    }

    const initiative = this.initiativeRepository.create({
      title: dto.title,
      description: dto.description,
      keyResultId: dto.keyResultId,
      assigneeId: dto.assigneeId,
    }) as unknown as Initiative;
    const saved = await this.initiativeRepository.save(initiative) as unknown as Initiative;
    return this.findOne(saved.id);
  }

  async findOne(id: string) {
    const initiative = await this.initiativeRepository.findOne({
      where: { id },
      relations: { keyResult: true, assignee: true },
    });
    if (!initiative) {
      throw new NotFoundException('Initiative not found');
    }
    return initiative;
  }

  async update(id: string, dto: UpdateInitiativeDto) {
    const initiative = await this.initiativeRepository.findOne({
      where: { id },
    });
    if (!initiative) {
      throw new NotFoundException('Initiative not found');
    }

    if (dto.title !== undefined) initiative.title = dto.title;
    if (dto.description !== undefined) initiative.description = dto.description;
    if (dto.status !== undefined) initiative.status = dto.status;
    if (dto.assigneeId !== undefined) initiative.assigneeId = dto.assigneeId;

    await this.initiativeRepository.save(initiative) as unknown as Initiative;
    return this.findOne(id);
  }

  async remove(id: string) {
    const initiative = await this.initiativeRepository.findOne({
      where: { id },
    });
    if (!initiative) {
      throw new NotFoundException('Initiative not found');
    }
    await this.initiativeRepository.remove(initiative);
    return { message: 'Initiative deleted' };
  }
}
