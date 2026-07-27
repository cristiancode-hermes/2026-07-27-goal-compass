import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { KeyResult } from './key-result.entity';
import { User } from './user.entity';

@Entity({ name: 'check_ins' })
export class CheckIn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'value', type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ name: 'confidence', type: 'integer' })
  confidence: number;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'key_result_id', type: 'varchar' })
  keyResultId: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @ManyToOne(() => KeyResult, (keyResult) => keyResult.checkIns)
  @JoinColumn({ name: 'key_result_id' })
  keyResult: KeyResult;

  @ManyToOne(() => User, (user) => user.checkIns)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
