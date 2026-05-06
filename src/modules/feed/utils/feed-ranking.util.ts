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

  const ageHours =
    (
      Date.now() -
      new Date(createdAt).getTime()
    ) /
    (1000 * 60 * 60);

  const recency =
    Math.max(1, 48 - ageHours);

  let score =
    recency +
    likes * 2 +
    comments * 3;

  if (isFollowingAuthor) {
    score += 20;
  }

  return score;
}