import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyResultsController } from './key-results.controller';
import { KeyResultsService } from './key-results.service';
import { KeyResult } from '../entities/key-result.entity';
import { Objective } from '../entities/objective.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KeyResult, Objective])],
  controllers: [KeyResultsController],
  providers: [KeyResultsService],
  exports: [KeyResultsService],
})
export class KeyResultsModule {}
