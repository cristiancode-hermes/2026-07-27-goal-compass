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
import { Objective } from './objective.entity';
import { CheckIn } from './check-in.entity';
import { Initiative } from './initiative.entity';

@Entity({ name: 'key_results' })
export class KeyResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'title', type: 'varchar' })
  title: string;

  @Column({ name: 'type', type: 'varchar' })
  type: 'percentage' | 'number' | 'currency' | 'binary';

  @Column({ name: 'unit', type: 'varchar', nullable: true })
  unit?: string;

  @Column({ name: 'metadata', type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'start_value', type: 'decimal', precision: 10, scale: 2 })
  startValue: number;

  @Column({ name: 'current_value', type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentValue: number;

  @Column({ name: 'target_value', type: 'decimal', precision: 10, scale: 2 })
  targetValue: number;

  @Column({ name: 'progress', type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number;

  @Column({ name: 'objective_id', type: 'varchar' })
  objectiveId: string;

  @Column({ name: 'owner_id', type: 'varchar', nullable: true })
  ownerId?: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt?: Date;

  @ManyToOne(() => Objective, (objective) => objective.keyResults)
  @JoinColumn({ name: 'objective_id' })
  objective: Objective;

  @OneToMany(() => CheckIn, (checkIn) => checkIn.keyResult)
  checkIns: CheckIn[];

  @OneToMany(() => Initiative, (initiative) => initiative.keyResult)
  initiatives: Initiative[];
}
