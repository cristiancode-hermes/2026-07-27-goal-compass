import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TeamMember } from './team-member.entity';
import { Objective } from './objective.entity';
import { CheckIn } from './check-in.entity';
import { Initiative } from './initiative.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'email', type: 'varchar', unique: true })
  email: string;

  @Column({ name: 'password', type: 'varchar' })
  password: string;

  @Column({ name: 'avatar', type: 'varchar', nullable: true })
  avatar?: string;

  @Column({ name: 'role', type: 'varchar', default: 'member' })
  role: 'admin' | 'member';

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt?: Date;

  @OneToMany(() => TeamMember, (teamMember) => teamMember.user)
  teamMembers: TeamMember[];

  @OneToMany(() => Objective, (objective) => objective.owner)
  objectives: Objective[];

  @OneToMany(() => CheckIn, (checkIn) => checkIn.user)
  checkIns: CheckIn[];

  @OneToMany(() => Initiative, (initiative) => initiative.assignee)
  initiatives: Initiative[];
}
