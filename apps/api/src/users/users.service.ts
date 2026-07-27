import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async search(search?: string, teamId?: string) {
    const qb = this.userRepository.createQueryBuilder('user');

    if (search) {
      qb.where('user.name LIKE :search OR user.email LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (teamId) {
      qb.innerJoin('user.teamMembers', 'tm', 'tm.teamId = :teamId', { teamId });
    }

    const users = await qb.getMany();
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      role: u.role,
    }));
  }
}
