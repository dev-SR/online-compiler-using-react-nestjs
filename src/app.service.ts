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

const outputDirPath = join(__dirname, 'outputs');
const inputDirPath = join(__dirname, 'inputs');

if (!existsSync(outputDirPath)) {
  mkdirSync(outputDirPath, { recursive: true });
}
if (!existsSync(dirCodes)) {
  mkdirSync(dirCodes, { recursive: true });
}
if (!existsSync(inputDirPath)) {
  mkdirSync(inputDirPath, { recursive: true });
}
@Injectable()
export class AppService {
  constructor(private readonly jobService: JobsService) {}

  getHello(): string {
    return 'Hello World!';
  }
  getJobById(id): Promise<Jobs> {
    return this.jobService.getJobById(id);
  }
  async generateFile(extension, content, input?: undefined): Promise<Jobs> {
    const jobId = uuid();
    const filename = `${jobId}.${extension}`;
    const filepath = join(dirCodes, filename);
    await writeFileSync(filepath, content);

    let inputFilePath;
    if (input) {
      const inputFile = `${jobId}.txt`;
      inputFilePath = join(inputDirPath, inputFile);
      await writeFileSync(inputFilePath, input);
    }

    const job = await this.jobService.createNewJob(
      extension,
      filepath,
      inputFilePath,
    );

    return job;
  }

  async startJob(job: Jobs) {
    const j = job;
    j.startedAt = new Date();

    let output: { result: string; isError: number };

    if (job.language_ext === 'cpp') {
      output = await this.executeCpp(job);
    } else if (job.language_ext === 'c') {
      output = await this.executeC(job);
    } else if (job.language_ext === 'py') {
      output = await this.executePy(job);
    } else if (job.language_ext === 'js') {
      output = await this.executeJs(job);
    } else if (job.language_ext === 'ts') {
      output = await this.executeTs(job);
    }

    console.log(output);
    j.completedAt = new Date();
    j.output = output.result;
    if (output.isError) j.status = STATUS.ERROR;
    else j.status = STATUS.SUCCESS;

    await this.jobService.updateJob(job);
    return;
  }

  async executeCpp(job: Jobs): Promise<{ result: string; isError: number }> {
    const filepath = job.filepath;
    // const jobId = basename(filepath).split('.')[0];
    const jobId = job.id;
    const outPath = join(outputDirPath, `${jobId}`);
    let isError = 0;

    let result;
    try {
      if (job.inputPath) {
        const p = await execProm(
          `g++ -Wall ${filepath} -o ${outPath}  && cd ${outputDirPath} && ${jobId}.exe < ${job.inputPath}`,
        );
        result = p.stdout;
      } else {
        const p = await execProm(
          `g++ ${filepath} -o ${outPath} && cd ${outputDirPath} && ${jobId}.exe`,
        );
        result = p.stdout;
      }
    } catch (ex) {
      result = ex.stderr;
      isError = 1;
    }

    console.log(result);

    return { result, isError };
  }
  async executeC(job: Jobs): Promise<{ result: string; isError: number }> {
    const filepath = job.filepath;
    const jobId = basename(filepath).split('.')[0];
    const outPath = join(outputDirPath, `${jobId}`);
    let isError = 0;

    let result;
    try {
      if (job.inputPath) {
        const p = await execProm(
          `gcc -Wall ${filepath} -o ${outPath}  && cd ${outputDirPath} && ${jobId}.exe < ${job.inputPath}`,
        );
        result = p.stdout;
      } else {
        const p = await execProm(
          `gcc ${filepath} -o ${outPath} && cd ${outputDirPath} && ${jobId}.exe`,
        );
        result = p.stdout;
      }
    } catch (ex) {
      result = ex.stderr;
      isError = 1;
    }

    console.log(result);

    return { result, isError };
  }
  async executePy(job: Jobs): Promise<{ result: string; isError: number }> {
    const filepath = job.filepath;

    let result;
    let isError = 0;
    try {
      if (job.inputPath) {
        const p = await execProm(`python ${filepath} < ${job.inputPath}`);
        result = p.stdout;
      } else {
        const p = await execProm(`python ${filepath}`);
        result = p.stdout;
      }
    } catch (ex) {
      result = ex.stderr;
      result;
      isError = 1;
    }

    return { result, isError };
  }
  async executeJs(job: Jobs): Promise<{ result: string; isError: number }> {
    const filepath = job.filepath;

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

  async executeTs(job: Jobs): Promise<{ result: string; isError: number }> {
    const filepath = job.filepath;

    let result;
    let isError = 0;
    try {
      const p = await execProm(`ts-node ${filepath}`);
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
