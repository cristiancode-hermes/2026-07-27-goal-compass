import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeyResult } from '../entities/key-result.entity';
import { Objective } from '../entities/objective.entity';
import { CreateKeyResultDto } from './dto/create-key-result.dto';
import { UpdateKeyResultDto } from './dto/update-key-result.dto';
import { ListKeyResultsDto } from './dto/list-key-results.dto';

@Injectable()
export class KeyResultsService {
  constructor(
    @InjectRepository(KeyResult)
    private keyResultRepository: Repository<KeyResult>,
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,
  ) {}

  async findAll(query: ListKeyResultsDto) {
    const where: any = {};
    if (query.objectiveId) where.objectiveId = query.objectiveId;
    if (query.ownerId) where.ownerId = query.ownerId;

    return this.keyResultRepository.find({
      where,
      relations: { objective: true },
      order: { createdAt: 'ASC' },
    });
  }

  async create(dto: CreateKeyResultDto) {
    const objective = await this.objectiveRepository.findOne({
      where: { id: dto.objectiveId },
    });
    if (!objective) {
      throw new NotFoundException('Objective not found');
    }

    const kr = this.keyResultRepository.create({
      title: dto.title,
      type: dto.type,
      unit: dto.unit,
      startValue: dto.startValue,
      currentValue: dto.startValue,
      targetValue: dto.targetValue,
      objectiveId: dto.objectiveId,
      ownerId: dto.ownerId,
    }) as unknown as KeyResult;
    const saved = await this.keyResultRepository.save(kr) as unknown as KeyResult;
    return this.findOne(saved.id);
  }

  async findOne(id: string) {
    const kr = await this.keyResultRepository.findOne({
      where: { id },
      relations: {
        checkIns: { user: true },
        objective: true,
      },
    });
    if (!kr) {
      throw new NotFoundException('Key result not found');
    }
    return kr;
  }

  async update(id: string, dto: UpdateKeyResultDto) {
    const kr = await this.keyResultRepository.findOne({ where: { id } });
    if (!kr) {
      throw new NotFoundException('Key result not found');
    }

    if (dto.title !== undefined) kr.title = dto.title;
    if (dto.targetValue !== undefined) kr.targetValue = dto.targetValue;
    if (dto.unit !== undefined) kr.unit = dto.unit;
    if (dto.type !== undefined) kr.type = dto.type;
    if (dto.ownerId !== undefined) kr.ownerId = dto.ownerId;

    await this.keyResultRepository.save(kr) as unknown as KeyResult;
    return this.findOne(id);
  }

  async remove(id: string) {
    const kr = await this.keyResultRepository.findOne({
      where: { id },
      relations: { checkIns: true, initiatives: true },
    });
    if (!kr) {
      throw new NotFoundException('Key result not found');
    }
    await this.keyResultRepository.remove(kr);
    return { message: 'Key result deleted' };
  }
}
