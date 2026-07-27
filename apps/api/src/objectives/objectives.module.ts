import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectivesController } from './objectives.controller';
import { ObjectivesService } from './objectives.service';
import { Objective } from '../entities/objective.entity';
import { KeyResult } from '../entities/key-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Objective, KeyResult])],
  controllers: [ObjectivesController],
  providers: [ObjectivesService],
  exports: [ObjectivesService],
})
export class ObjectivesModule {}
