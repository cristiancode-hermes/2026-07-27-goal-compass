import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Cycle } from './cycle.entity';
import { Team } from './team.entity';
import { User } from './user.entity';
import { KeyResult } from './key-result.entity';

@Entity({ name: 'objectives' })
export class Objective {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'title', type: 'varchar' })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'type', type: 'varchar' })
  type: 'committed' | 'aspirational';

  @Column({ name: 'progress', type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number;

  @Column({ name: 'status', type: 'varchar', default: 'on-track' })
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';

  @Column({ name: 'weight', type: 'decimal', precision: 3, scale: 1, default: 1.0 })
  weight: number;

  @Column({ name: 'cycle_id', type: 'varchar' })
  cycleId: string;

  @Column({ name: 'owner_id', type: 'varchar', nullable: true })
  ownerId?: string;

  @Column({ name: 'team_id', type: 'varchar' })
  teamId: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt?: Date;

  @ManyToOne(() => Cycle, (cycle) => cycle.objectives)
  @JoinColumn({ name: 'cycle_id' })
  cycle: Cycle;

  @ManyToOne(() => Team, (team) => team.objectives)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => User, (user) => user.objectives)
  @JoinColumn({ name: 'owner_id' })
  owner?: User;

  @OneToMany(() => KeyResult, (keyResult) => keyResult.objective)
  keyResults: KeyResult[];
}
