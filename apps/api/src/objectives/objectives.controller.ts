import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ObjectivesService } from './objectives.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { ListObjectivesDto } from './dto/list-objectives.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('objectives')
export class ObjectivesController {
  constructor(private objectivesService: ObjectivesService) {}

  @Get()
  findAll(@Query() query: ListObjectivesDto) {
    return this.objectivesService.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateObjectiveDto) {
    return this.objectivesService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.objectivesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateObjectiveDto) {
    return this.objectivesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.objectivesService.remove(id);
  }
}
