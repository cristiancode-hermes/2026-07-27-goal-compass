import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Team } from './team.entity';
import { User } from './user.entity';

@Entity({ name: 'team_members' })
@Unique(['teamId', 'userId'])
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'team_id', type: 'varchar' })
  teamId: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @Column({ name: 'role', type: 'varchar', default: 'member' })
  role: 'admin' | 'member';

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @ManyToOne(() => Team, (team) => team.teamMembers)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => User, (user) => user.teamMembers)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
