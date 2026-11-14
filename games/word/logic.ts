export type Mark = "correct" | "present" | "absent";

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

/** Letters only, accents removed (é = e), lowercase. */
export function cleanGuess(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

/** Standard two-pass marking so repeated letters are handled correctly. */
export function markGuess(guess: string, answer: string): Mark[] {
  const marks: Mark[] = Array(guess.length).fill("absent");
  const left: Record<string, number> = {};
  for (let i = 0; i < answer.length; i++) {
    if (guess[i] === answer[i]) marks[i] = "correct";
    else left[answer[i]] = (left[answer[i]] ?? 0) + 1;
  }
  for (let i = 0; i < guess.length; i++) {
    if (marks[i] === "correct") continue;
    const c = guess[i];
    if (left[c]) {
      marks[i] = "present";
      left[c]--;
    }
  }
  return marks;
}

export function rawScore(guessesUsed: number, solved: boolean): number {
  return solved ? MAX_GUESSES + 1 - guessesUsed : 0;
}
