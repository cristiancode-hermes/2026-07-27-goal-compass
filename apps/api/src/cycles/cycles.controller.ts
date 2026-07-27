import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CyclesService } from './cycles.service';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { UpdateCycleDto } from './dto/update-cycle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cycles')
export class CyclesController {
  constructor(private cyclesService: CyclesService) {}

  @Get()
  findAll() {
    return this.cyclesService.findAll();
  }

  @Get('current')
  getCurrent() {
    return this.cyclesService.getCurrent();
  }

  @Post()
  create(@Body() dto: CreateCycleDto) {
    return this.cyclesService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cyclesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCycleDto) {
    return this.cyclesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cyclesService.remove(id);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.cyclesService.activate(id);
  }

  @Patch(':id/close')
  close(@Param('id') id: string) {
    return this.cyclesService.close(id);
  }

  @Get(':id/summary')
  getSummary(@Param('id') id: string) {
    return this.cyclesService.getSummary(id);
  }
}
