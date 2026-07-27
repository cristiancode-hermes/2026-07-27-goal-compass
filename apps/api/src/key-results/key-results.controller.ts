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
import { KeyResultsService } from './key-results.service';
import { CreateKeyResultDto } from './dto/create-key-result.dto';
import { UpdateKeyResultDto } from './dto/update-key-result.dto';
import { ListKeyResultsDto } from './dto/list-key-results.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('key-results')
export class KeyResultsController {
  constructor(private keyResultsService: KeyResultsService) {}

  @Get()
  findAll(@Query() query: ListKeyResultsDto) {
    return this.keyResultsService.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateKeyResultDto) {
    return this.keyResultsService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.keyResultsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateKeyResultDto) {
    return this.keyResultsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.keyResultsService.remove(id);
  }
}
