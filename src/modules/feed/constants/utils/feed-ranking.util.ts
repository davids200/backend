export function calculateScore(params: {
  createdAt: Date;
  likes: number;
  comments: number;
  isFollowingAuthor: boolean;
  interestScore?: number;
  isSameLocation?: boolean;
  shares?: number;
  watchTime?: number;
}) {

  const {
    createdAt,
    likes,
    comments,
    isFollowingAuthor,
    interestScore = 0,
    isSameLocation = false,
    shares = 0,
    watchTime = 0,
  } = params;

  // ============================================
  // SAFE DATE
  // ============================================

  const createdTimestamp =
    new Date(createdAt).getTime();

  if (
    Number.isNaN(
      createdTimestamp,
    )
  ) {

    return 0;
  }

  const now = Date.now();

  const safeTimestamp =
    Math.min(
      createdTimestamp,
      now,
    );

  // ============================================
  // AGE
  // ============================================

  const ageHours =
    (now - safeTimestamp) /
    (1000 * 60 * 60);

  // ============================================
  // RECENCY
  // ============================================

  const recency =
    Math.max(
      1,
      48 - ageHours,
    );

  // ============================================
  // BASE SCORE
  // ============================================

  let score =recency +likes * 2 + comments * 3 + shares * 4 + watchTime * 0.1;

  // ============================================
  // FOLLOW BOOST
  // ============================================

  if (
    isFollowingAuthor
  ) {

    score += 20;
  }

  // ============================================
  // INTEREST BOOST
  // ============================================

  score +=
    interestScore * 5;

  // ============================================
  // LOCATION BOOST
  // ============================================

  if (
    isSameLocation
  ) {

    score += 10;
  }

  return Math.max(
    1,
    Math.floor(score),
  );
}