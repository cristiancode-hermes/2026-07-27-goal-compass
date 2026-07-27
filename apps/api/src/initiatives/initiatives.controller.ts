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
import { InitiativesService } from './initiatives.service';
import { CreateInitiativeDto } from './dto/create-initiative.dto';
import { UpdateInitiativeDto } from './dto/update-initiative.dto';
import { ListInitiativesDto } from './dto/list-initiatives.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('initiatives')
export class InitiativesController {
  constructor(private initiativesService: InitiativesService) {}

  @Get()
  findAll(@Query() query: ListInitiativesDto) {
    return this.initiativesService.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateInitiativeDto) {
    return this.initiativesService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.initiativesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInitiativeDto) {
    return this.initiativesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.initiativesService.remove(id);
  }
}
