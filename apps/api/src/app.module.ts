import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { CyclesModule } from './cycles/cycles.module';
import { ObjectivesModule } from './objectives/objectives.module';
import { KeyResultsModule } from './key-results/key-results.module';
import { CheckInsModule } from './check-ins/check-ins.module';
import { InitiativesModule } from './initiatives/initiatives.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'data/goal-compass.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),
    AuthModule,
    UsersModule,
    TeamsModule,
    CyclesModule,
    ObjectivesModule,
    KeyResultsModule,
    CheckInsModule,
    InitiativesModule,
    DashboardModule,
    SeedModule,
  ],
})
export class AppModule {}
