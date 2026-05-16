import {  Injectable,} from '@nestjs/common';
import { RedisService } from '../../infrastructure/redis/redis.service';

@Injectable()
export class FeedRankingService {

  constructor(
    private readonly redis:RedisService,
  ) {}
   
  // CALCULATE SCORE
  // =====================================================
calculateScore(params:{
  likes?:number;
  comments?:number;
  reposts?:number;
  bookmarks?:number;
  views?:number;
  dwellTimeMs?:number;
  createdAt:Date;
  completionRate?:number;
  isFollowingAuthor?:boolean;
  isLocalAuthor?:boolean;
}){

  const {
    likes = 0,
    comments = 0,
    reposts = 0,
    bookmarks = 0,
    views = 0,
    dwellTimeMs = 0,    
    createdAt,
    completionRate = 0,
    isFollowingAuthor = false,
    isLocalAuthor = false,
  } = params;

  const createdTime = new Date(createdAt).getTime();
  const safeCreatedTime =isNaN(createdTime) ? Date.now(): createdTime;
  let score = 0;
  

  // ENGAGEMENT
  // ================================================
  score += likes * 100;
  score += comments * 200;
  score += reposts * 400;
  score += bookmarks * 500;

  // ================================================
  // VIEW QUALITY
  // ================================================
  score += Math.floor(views * 2,);

  // ================================================
  // DWELL QUALITY
  // ================================================
const dwellSeconds =
  dwellTimeMs / 1000;

// ================================================
// VIEW QUALITY
// ================================================

score += Math.floor(
  views * 2,
);

// ================================================
// DWELL QUALITY
// ================================================

if (dwellSeconds >= 3){
  score += 20;
}

if (dwellSeconds >= 10){
  score += 40;
}

// ================================================
// VIDEO COMPLETION
// ================================================

if (completionRate >= 0.5){
  score += 80;
}

if (completionRate >= 0.8){
  score += 150;
}

if (completionRate >= 1){
  score += 250;
}

  // ================================================
  // RELATIONSHIP BOOST
  // ================================================
  if (isFollowingAuthor){
    score += 30;
  }

  // ================================================
  // LOCAL BOOST
  // ================================================

  if (isLocalAuthor){
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

  score -= ageHours * 0.5;

  const finalScore =
    Math.max(
      Math.floor(score),
      0,
    );

  console.log('RANK SCORE',{
    likes,
    comments,
    reposts,
    bookmarks,
    views,
    dwellSeconds,
    ageHours,
    finalScore,
  });

  return finalScore;
}



// =====================================================
// GET POST RANK SCORE
// =====================================================
async getPostRankScore(postId:string,) {
  const score = await this.redis.client.zscore('post_rankings',postId,);
  return Number(score || 0);
}

  
}