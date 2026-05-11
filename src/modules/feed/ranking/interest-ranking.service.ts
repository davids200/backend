import { Injectable } from "@nestjs/common";

@Injectable()
export class InterestRankingService {

  async rankPost(
    userInterestScore: number,
    baseScore: number,
  ) {

    return (
      baseScore +
      userInterestScore * 10
    );
  }
}