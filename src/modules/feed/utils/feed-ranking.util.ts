



export function calculateScore(params: {
  createdAt: string;
  likes: number;
  comments: number;
  isFollowingAuthor: boolean;
}): number {
  const timeScore = new Date(params.createdAt).getTime() / 1000;

  const engagementScore =
    params.likes * 2 + params.comments * 3;

  const followBoost = params.isFollowingAuthor ? 50 : 0;

  return timeScore + engagementScore + followBoost;
}