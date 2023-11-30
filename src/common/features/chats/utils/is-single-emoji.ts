export function isSingleEmoji(input: string) {
  const emojiRegex = /^\p{Emoji}$/u; // Unicode property escapes for emoji

  return emojiRegex.test(input);
}
