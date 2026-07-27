import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CheckInsService } from './check-ins.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { ListCheckInsDto } from './dto/list-check-ins.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('check-ins')
export class CheckInsController {
  constructor(private checkInsService: CheckInsService) {}

  @Get()
  findAll(@Query() query: ListCheckInsDto) {
    return this.checkInsService.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateCheckInDto, @Req() req: any) {
    return this.checkInsService.create(dto, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.checkInsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.checkInsService.remove(id);
  }
}
