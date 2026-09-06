// Text case formatting utility for Capital, Small, and Title Case

export type TextCaseMode = 'capital' | 'title' | 'small';

/**
 * Converts a string into Title Case (Small with Capital initials).
 * Handles hyphenated words, commas, and parentheses.
 * e.g. "UTTAR CHANDAN, PALASH, JHINARDI - 1610, NARSINGDI" -> "Uttar Chandan, Palash, Jhinardi - 1610, Narsingdi"
 */
export function toTitleCase(str: string): string {
  if (!str) return '';

  // Words that can stay lowercase in the middle of sentences if desired, but for passport/CV addresses & names we capitalize major words
  return str.replace(/\b([a-zA-Z])([a-zA-Z0-9]*)\b/g, (match, firstLetter, rest) => {
    // Preserve common abbreviations if detected
    const upper = match.toUpperCase();
    if (['NID', 'SSC', 'HSC', 'USA', 'UAE', 'KSA', 'DIP', 'KG', 'POB'].includes(upper)) {
      return upper;
    }
    return firstLetter.toUpperCase() + rest.toLowerCase();
  });
}

/**
 * Converts a string into ALL CAPS (Capital)
 */
export function toCapitalCase(str: string): string {
  if (!str) return '';
  return str.toUpperCase();
}

/**
 * Converts a string into lowercase (Small)
 */
export function toLowerCase(str: string): string {
  if (!str) return '';
  return str.toLowerCase();
}

/**
 * Transforms a text string according to the requested case mode
 */
export function transformCase(str: string, mode: TextCaseMode): string {
  if (!str) return '';
  switch (mode) {
    case 'capital':
      return toCapitalCase(str);
    case 'title':
      return toTitleCase(str);
    case 'small':
      return toLowerCase(str);
    default:
      return str;
  }
}
