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

@Entity({ name: 'teams' })
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt?: Date;

  @OneToMany(() => TeamMember, (teamMember) => teamMember.team)
  teamMembers: TeamMember[];

  @OneToMany(() => Objective, (objective) => objective.team)
  objectives: Objective[];
}
