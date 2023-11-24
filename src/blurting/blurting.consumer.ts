import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { BlurtingService } from './blurting.service';
import { BlurtingGroupEntity } from 'src/entities';
import { FcmService } from 'src/firebase/fcm.service';

@Processor('blurtingQuestions')
export class BlurtingConsumer {
  constructor(
    private blurtingService: BlurtingService,
    private fcmService: FcmService,
  ) {}
  @Process()
  async processNewBlurtingQuestion(job: Job) {
    const question: string = job.data.question;
    const group: BlurtingGroupEntity = job.data.group;
    const users: number[] = job.data.users;
    await this.blurtingService.insertQuestionToGroup(
      question,
      group,
      job.data.no,
    );
    await Promise.all(
      users.map(async (userid) => {
        await this.fcmService.sendPush(
          userid,
          `${job.data.no}번쨰 질문이 등록되었습니다!`,
          `그룹 질문에 응답해주세요.`,
        );
      }),
    );
  }
}
