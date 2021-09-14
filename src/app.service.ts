import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { v4 as uuid } from 'uuid';
import { Jobs, STATUS } from './jobs/Job.entity';
import { JobsService } from './jobs/jobs.service';
import { exec } from 'child_process';
import * as util from 'util';
const execProm = util.promisify(exec);

const dirCodes = join(__dirname, 'codes');

const outputPath = join(__dirname, 'outputs');

if (!existsSync(outputPath)) {
  mkdirSync(outputPath, { recursive: true });
}
if (!existsSync(dirCodes)) {
  mkdirSync(dirCodes, { recursive: true });
}
@Injectable()
export class AppService {
  constructor(private readonly jobService: JobsService) {}

  getHello(): string {
    return 'Hello World!';
  }
  async generateFile(
    extension,
    content,
  ): Promise<{ job: Jobs; filepath: string }> {
    const jobId = uuid();
    const filename = `${jobId}.${extension}`;
    const filepath = join(dirCodes, filename);
    await writeFileSync(filepath, content);

    const job = await this.jobService.createNewJob(extension, filepath);

    return { job, filepath };
  }

  async startJob(extension, filepath, job: Jobs) {
    const j = job;
    j.startedAt = new Date();

    let output: { result: string; isError: number };

    if (extension === 'cpp') {
      output = await this.executeCpp(filepath);
    } else if (extension === 'c') {
      // output = await this.executeC(filepath);
    } else if (extension === 'py') {
      // output = await this.executePy(filepath);
    } else if (extension === 'js') {
      output = await this.executeJs(filepath);
    }

    j.completedAt = new Date();
    j.output = output.result;
    if (output.isError) j.status = STATUS.ERROR;
    else j.status = STATUS.SUCCESS;

    await this.jobService.updateJob(job);
    return;
  }

  async executeCpp(filepath): Promise<{ result: string; isError: number }> {
    const jobId = basename(filepath).split('.')[0];
    const outPath = join(outputPath, `${jobId}`);
    let isError = 0;

    let result;
    try {
      const p = await execProm(
        `g++ ${filepath} -o ${outPath} && cd ${outputPath} && ${jobId}.exe`,
      );
      result = p.stdout;
    } catch (ex) {
      result = ex.stderr;
      isError = 1;
    }

    console.log(result);

    return { result, isError };
  }
  async executeC(filepath): Promise<{ result: string; isError: number }> {
    const jobId = basename(filepath).split('.')[0];
    const outPath = join(outputPath, `${jobId}`);
    let isError = 0;

    let result;
    try {
      const p = await execProm(
        `gcc ${filepath} -o ${outPath} && cd ${outputPath} && ${jobId}.exe`,
      );
      result = p.stdout;
    } catch (ex) {
      result = ex.stderr;
      isError = 1;
    }

    console.log(result);

    return { result, isError };
  }
  async executePy(filepath): Promise<{ result: string; isError: number }> {
    let result;
    let isError = 0;
    try {
      const p = await execProm(`py ${filepath}`);
      result = p.stdout;
      result;
    } catch (ex) {
      result = ex.stderr;
      result;
      isError = 1;
    }

    return { result, isError };
  }
  async executeJs(filepath): Promise<{ result: string; isError: number }> {
    let result;
    let isError = 0;
    try {
      const p = await execProm(`node ${filepath}`);
      result = p.stdout;
      result;
    } catch (ex) {
      result = ex.stderr;
      result;
      isError = 1;
    }

    return { result, isError };
  }
}
