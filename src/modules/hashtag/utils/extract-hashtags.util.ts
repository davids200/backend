export function extractHashtags(
  text: string,
): string[] {

  const matches =
    text.match(/#\w+/g) || [];

  return [
    ...new Set(
      matches.map(tag =>
        tag.toLowerCase(),
      ),
    ),
  ];
}

// WHY SET()?
// Prevents duplicates.
// Example:
// #uganda #uganda #uganda
