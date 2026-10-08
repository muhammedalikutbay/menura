/** Up to two capital letters for the logo tile when a restaurant has no logo ("Lezzet Durağı" -> "LD"). */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0], words[1]] : [words[0]];
  return letters
    .map((word) => (word ? [...word][0]! : ""))
    .join("")
    .toLocaleUpperCase("tr-TR");
}
