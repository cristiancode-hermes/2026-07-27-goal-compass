import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    }) as unknown as User;
    const saved = await this.userRepository.save(user) as unknown as User;

    const token = this.jwtService.sign({
      sub: saved.id,
      email: saved.email,
    });

    return {
      user: {
        id: saved.id,
        name: saved.name,
        email: saved.email,
        role: saved.role,
        avatar: saved.avatar,
        createdAt: saved.createdAt,
      },
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.avatar !== undefined) user.avatar = dto.avatar;

    const saved = await this.userRepository.save(user) as unknown as User;
    return {
      id: saved.id,
      name: saved.name,
      email: saved.email,
      role: saved.role,
      avatar: saved.avatar,
      createdAt: saved.createdAt,
    };
  }
}
