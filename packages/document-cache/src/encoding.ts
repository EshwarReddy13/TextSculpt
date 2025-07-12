// Custom encoding for Firebase-safe, unique, and reversible keys
// Forbidden/special character mapping:
// . => %70, - => %80, # => %71, $ => %72, [ => %73, ] => %74, / => %75

const charMap: Record<string, string> = {
  '.': '%70',
  '-': '%80',
  '#': '%71',
  '$': '%72',
  '[': '%73',
  ']': '%74',
  '/': '%75',
};

const reverseCharMap: Record<string, string> = Object.fromEntries(
  Object.entries(charMap).map(([k, v]) => [v, k])
);

export function encodeForFirebase(input: string): string {
  let encoded = encodeURIComponent(input);
  // Replace each forbidden/special character with its unique code
  Object.keys(charMap).forEach((char) => {
    // Use split/join for global replacement
    encoded = encoded.split(char).join(charMap[char]);
  });
  return encoded;
}

export function decodeFromFirebase(encoded: string): string {
  let decoded = encoded;
  // Replace codes back to their original characters
  Object.keys(reverseCharMap).forEach((code) => {
    decoded = decoded.split(code).join(reverseCharMap[code]);
  });
  // Decode URI components
  return decodeURIComponent(decoded);
} 