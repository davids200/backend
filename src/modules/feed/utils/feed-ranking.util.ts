// src/modules/feed/utils/feed-ranking.util.ts

export function calculateScore(post: {
  createdAt: string | Date;
  likes?: number;
  comments?: number;
  isFollowingAuthor?: boolean;
}): number {
  const ageScore =
    Date.now() - new Date(post.createdAt).getTime();

  const engagementScore =
    (post.likes || 0) * 2 +
    (post.comments || 0) * 3;

  const authorBoost = post.isFollowingAuthor ? 50 : 0;

  return engagementScore + authorBoost - ageScore * 0.000001;
}

