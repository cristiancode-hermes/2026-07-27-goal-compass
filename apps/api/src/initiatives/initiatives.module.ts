import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InitiativesController } from './initiatives.controller';
import { InitiativesService } from './initiatives.service';
import { Initiative } from '../entities/initiative.entity';
import { KeyResult } from '../entities/key-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Initiative, KeyResult])],
  controllers: [InitiativesController],
  providers: [InitiativesService],
  exports: [InitiativesService],
})
export class InitiativesModule {}
