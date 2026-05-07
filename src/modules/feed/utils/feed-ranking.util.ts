export function calculateScore(params: {
  createdAt: Date;
  likes: number;
  comments: number;
  isFollowingAuthor: boolean;
}) {

  const {
    createdAt,
    likes,
    comments,
    isFollowingAuthor,
  } = params;

  // ============================================
  // SAFE DATE PARSING
  // ============================================

  const createdTimestamp =
    new Date(createdAt).getTime();

  // invalid date protection
  if (
    Number.isNaN(createdTimestamp)
  ) {
    return 0;
  }

  const now = Date.now();

  // prevent future timestamps
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
  // ENGAGEMENT
  // ============================================

  let score =
    recency +
    likes * 2 +
    comments * 3;

  // ============================================
  // FOLLOW BOOST
  // ============================================

  if (isFollowingAuthor) {
    score += 20;
  }

  return Math.max(
    1,
    Math.floor(score),
  );
}