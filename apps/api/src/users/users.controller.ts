import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { SearchUsersDto } from './dto/search-users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  search(@Query() query: SearchUsersDto) {
    return this.usersService.search(query.search, query.teamId);
  }
}
