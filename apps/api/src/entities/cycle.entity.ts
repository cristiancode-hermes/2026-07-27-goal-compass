import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Objective } from './objective.entity';

@Entity({ name: 'cycles' })
export class Cycle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ name: 'status', type: 'varchar', default: 'draft' })
  status: 'draft' | 'active' | 'closed';

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt?: Date;

  @OneToMany(() => Objective, (objective) => objective.cycle)
  objectives: Objective[];
}
