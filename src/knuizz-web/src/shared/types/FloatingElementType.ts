export const FloatingElementType = {
  QuestionMark: "QuestionMark",
  Book: "Book",
  Brain: "Brain",
  Cup: "Cup",
  Flask: "Flask",
  Globe: "Globe",
  Music: "Music",
  Puzzle: "Puzzle",
} as const;

export type FloatingElementType =
  (typeof FloatingElementType)[keyof typeof FloatingElementType];
