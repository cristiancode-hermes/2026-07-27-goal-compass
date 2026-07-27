import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  findAll() {
    return this.teamsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateTeamDto, @Req() req: any) {
    return this.teamsService.create(dto, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTeamDto) {
    return this.teamsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamsService.remove(id);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.teamsService.addMember(id, dto);
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.teamsService.removeMember(id, userId);
  }

  @Get(':id/objectives')
  getObjectives(@Param('id') id: string) {
    return this.teamsService.getObjectives(id);
  }
}
