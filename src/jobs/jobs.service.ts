import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jobs } from './Job.entity';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Jobs) private readonly jobsRepository: Repository<Jobs>,
  ) {}

  private readonly logger = new Logger(JobsService.name);

  async getAllJobs() {
    return await this.jobsRepository.find();
  }
  async createNewJob(extension, filepath): Promise<Jobs> {
    const newJob = new Jobs();
    newJob.language_ext = extension;
    newJob.filepath = filepath;

    return await this.jobsRepository.save(newJob);
  }

  async updateJob(job: Jobs) {
    await this.jobsRepository.update(job.id, job);
  }
}
