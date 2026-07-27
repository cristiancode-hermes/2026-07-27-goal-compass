import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckIn } from '../entities/check-in.entity';
import { KeyResult } from '../entities/key-result.entity';
import { Objective } from '../entities/objective.entity';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { ListCheckInsDto } from './dto/list-check-ins.dto';

@Injectable()
export class CheckInsService {
  constructor(
    @InjectRepository(CheckIn)
    private checkInRepository: Repository<CheckIn>,
    @InjectRepository(KeyResult)
    private keyResultRepository: Repository<KeyResult>,
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,
  ) {}

  async findAll(query: ListCheckInsDto) {
    const where: any = {};
    if (query.keyResultId) where.keyResultId = query.keyResultId;

    return this.checkInRepository.find({
      where,
      relations: { user: true, keyResult: true },
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateCheckInDto, userId: string) {
    const kr = await this.keyResultRepository.findOne({
      where: { id: dto.keyResultId },
    });
    if (!kr) {
      throw new NotFoundException('Key result not found');
    }

    const checkIn = this.checkInRepository.create({
      value: dto.value,
      confidence: dto.confidence,
      notes: dto.notes,
      keyResultId: dto.keyResultId,
      userId,
    }) as unknown as CheckIn;
    const saved = await this.checkInRepository.save(checkIn) as unknown as CheckIn;

    // Update key result current value and progress
    await this.updateKeyResultProgress(kr, dto.value);

    return this.checkInRepository.findOne({
      where: { id: saved.id },
      relations: { user: true, keyResult: true },
    });
  }

  async findOne(id: string) {
    const checkIn = await this.checkInRepository.findOne({
      where: { id },
      relations: { user: true, keyResult: true },
    });
    if (!checkIn) {
      throw new NotFoundException('Check-in not found');
    }
    return checkIn;
  }

  async remove(id: string) {
    const checkIn = await this.checkInRepository.findOne({
      where: { id },
      relations: { keyResult: true },
    });
    if (!checkIn) {
      throw new NotFoundException('Check-in not found');
    }

    const krId = checkIn.keyResultId;

    await this.checkInRepository.remove(checkIn);

    // Recalculate progress from latest check-in
    const latestCheckIn = await this.checkInRepository.findOne({
      where: { keyResultId: krId },
      order: { createdAt: 'DESC' },
    });

    const kr = await this.keyResultRepository.findOne({
      where: { id: krId },
    });
    if (kr) {
      const value = latestCheckIn ? latestCheckIn.value : kr.startValue;
      await this.updateKeyResultProgress(kr, value);
    }

    return { message: 'Check-in deleted' };
  }

  private async updateKeyResultProgress(kr: KeyResult, value: number) {
    kr.currentValue = value;

    let progress: number;
    const start = Number(kr.startValue);
    const target = Number(kr.targetValue);

    switch (kr.type) {
      case 'percentage':
        progress = Math.min(100, Math.max(0, value));
        break;
      case 'binary':
        progress = value >= 1 ? 100 : 0;
        break;
      default:
        // number or currency
        if (target === start) {
          progress = 0;
        } else {
          progress =
            ((value - start) / (target - start)) * 100;
          progress = Math.min(100, Math.max(0, progress));
        }
    }

    kr.progress = Math.round(progress * 100) / 100;

    await this.keyResultRepository.save(kr) as unknown as KeyResult;

    // Update objective progress
    await this.updateObjectiveProgress(kr.objectiveId);
  }

  private async updateObjectiveProgress(objectiveId: string) {
    const objective = await this.objectiveRepository.findOne({
      where: { id: objectiveId },
      relations: { keyResults: true },
    });
    if (!objective) return;

    const keyResults = objective.keyResults || [];
    if (keyResults.length === 0) {
      objective.progress = 0;
      objective.status = 'on-track';
    } else {
      const totalProgress = keyResults.reduce(
        (sum, kr) => sum + Number(kr.progress),
        0,
      );
      objective.progress =
        Math.round((totalProgress / keyResults.length) * 100) / 100;

      const allCompleted = keyResults.every(
        (kr) => Number(kr.progress) >= 100,
      );
      const progressVal = Number(objective.progress);

      if (allCompleted) {
        objective.status = 'completed';
      } else if (progressVal >= 70) {
        objective.status = 'on-track';
      } else if (progressVal >= 40) {
        objective.status = 'at-risk';
      } else {
        objective.status = 'behind';
      }
    }

    await this.objectiveRepository.save(objective) as unknown as Objective;
  }
}
