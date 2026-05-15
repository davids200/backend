// src/modules/ranking/feed-ranking.service.ts

import {
  Injectable,
} from '@nestjs/common';

@Injectable()
export class FeedRankingService {

  // =====================================================
  // CALCULATE SCORE
  // =====================================================

  calculateScore(params:{
    likes?:number;
    comments?:number;
    reposts?:number;
    createdAt:Date;
    isFollowingAuthor?:boolean;
    isLocalAuthor?:boolean;
  }) {

    const {
      likes = 0,
      comments = 0,
      reposts = 0,
      createdAt,
      isFollowingAuthor = false,
      isLocalAuthor = false,
    } = params;

    // ================================================
    // INVALID DATE PROTECTION
    // ================================================

    const createdTime =
      new Date(createdAt).getTime();

    const safeCreatedTime =
      isNaN(createdTime)
        ? Date.now()
        : createdTime;

    // ================================================
    // ENGAGEMENT SCORE
    // ================================================

    let score = 0;

    score += likes * 100;

    score += comments * 200;

    score += reposts * 400;

    // ================================================
    // FOLLOW BOOST
    // ================================================

    if (isFollowingAuthor) {
      score += 30;
    }

    // ================================================
    // LOCAL BOOST
    // ================================================

    if (isLocalAuthor) {
      score += 15;
    }

    // ================================================
    // RECENCY DECAY
    // ================================================

    const ageHours =
      Math.max(
        0,
        (Date.now() - safeCreatedTime)
        / (1000 * 60 * 60),
      );

    // gentle decay
    score -= ageHours * 0.5;

    // ================================================
    // CLEAN FINAL SCORE
    // ================================================

    const finalScore =
      Math.max(
        Math.floor(score),
        0,
      );

    console.log(
      'RANK SCORE',
      {
        likes,
        comments,
        reposts,
        ageHours,
        finalScore,
      },
    );

    return finalScore;
  }
}