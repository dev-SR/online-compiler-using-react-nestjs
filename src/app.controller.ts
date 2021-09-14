import { Body, Controller, Get, Logger, Post, Response } from '@nestjs/common';
import { AppService } from './app.service';
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
    this.logger.log(body);

    if (body.code === undefined) {
      return { success: false, error: 'Empty code body!' };
    }

    // need to generate a c++ file with content from the request
    const result = await this.appService.generateFile(
      body.extension,
      body.code,
    );

    res.status(201).json({ jobId: result.job.id });

    await this.appService.startJob(body.extension, result.filepath, result.job);
  }
}
