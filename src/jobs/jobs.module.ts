import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jobs } from './Job.entity';
import { JobsService } from './jobs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Jobs])],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
