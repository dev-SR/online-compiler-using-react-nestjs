import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Response,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Jobs } from './jobs/Job.entity';
import { JobsService } from './jobs/jobs.service';

@Controller('code')
export class AppController {
  constructor(private readonly appService: AppService) {}
  private logger = new Logger(AppController.name);

  @Get('/')
  async getHello() {
    return 'this.jobService.getAllJobs()';
  }

  @Post('/run')
  async runNewJob(@Body() body, @Response() res) {
    // this.logger.log(body);

    if (body.code === undefined) {
      return { success: false, error: 'Empty code body!' };
    }

    // need to generate a c++ file with content from the request
    let result: Jobs;

    if (body.input) {
      result = await this.appService.generateFile(
        body.extension,
        body.code,
        body.input,
      );
    } else {
      result = await this.appService.generateFile(body.extension, body.code);
    }

    res.status(201).json({ jobId: result.id });
    await this.appService.startJob(result);
  }

  @Get('/status')
  async getJobStatus(@Query('id') jobId: string) {
    if (jobId === undefined) {
      return { success: false, error: 'missing id query param' };
    }
    const job = await this.appService.getJobById(jobId);

    return { success: true, job };
  }
}
