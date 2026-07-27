import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { KeyResult } from './key-result.entity';
import { User } from './user.entity';

@Entity({ name: 'initiatives' })
export class Initiative {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'title', type: 'varchar' })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'status', type: 'varchar', default: 'todo' })
  status: 'todo' | 'in_progress' | 'done';

  @Column({ name: 'key_result_id', type: 'varchar' })
  keyResultId: string;

  @Column({ name: 'assignee_id', type: 'varchar', nullable: true })
  assigneeId?: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt?: Date;

  @ManyToOne(() => KeyResult, (keyResult) => keyResult.initiatives)
  @JoinColumn({ name: 'key_result_id' })
  keyResult: KeyResult;

  @ManyToOne(() => User, (user) => user.initiatives)
  @JoinColumn({ name: 'assignee_id' })
  assignee?: User;
}
