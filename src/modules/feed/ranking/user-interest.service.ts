import { Injectable }
from '@nestjs/common';

@Injectable()
export class UserInterestService {

  private interests =
    new Map<
      string,
      Map<string, number>
    >();

  async boostInterest(
    userId: string,
    topic: string,
    amount = 1,
  ) {

    if (
      !this.interests.has(
        userId,
      )
    ) {

      this.interests.set(
        userId,
        new Map(),
      );
    }

    const map =
      this.interests.get(
        userId,
      )!;

    const current =
      map.get(topic) || 0;

    map.set(
      topic,
      current + amount,
    );
  }

  async getInterestScore(userId: string,topic: string,  ) {

    return this.interests.get(userId)?.get(topic) || 0;
  }
}