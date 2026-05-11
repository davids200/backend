import { TOPIC_KEYWORDS }
from '../constants/topic-keywords.constant';

export function detectTopics(
  content: string,
): string[] {

  const text =
    content.toLowerCase();

  const detected =
    new Set<string>();

  for (
    const [topic, keywords]
    of Object.entries(
      TOPIC_KEYWORDS,
    )
  ) {

    for (
      const keyword of keywords
    ) {

      if (
        text.includes(
          keyword.toLowerCase(),
        )
      ) {

        detected.add(topic);

        break;
      }
    }
  }

  return [...detected];
}