import nlp from "compromise";
import {
  GENERIC_VERBS,
  STRONG_ACTION_VERBS,
  OUTPUT_FORMAT_KEYWORDS,
} from "./word.constants";

type NlpDocument = ReturnType<typeof nlp>;

export const LINTING_RULES = {
  Role: (text: string, doc: NlpDocument) => {
    const issues: string[] = [];
    if (text && !text.toLowerCase().startsWith("you are")) {
      issues.push(
        'Good roles often start with "You are..." to set a clear persona.'
      );
    }
    if (doc.sentences().isQuestion().found) {
      issues.push("The role should be a statement, not a question.");
    }
    return issues;
  },
  Context: (text: string, doc: NlpDocument) => {
    const issues: string[] = [];
    if (doc.verbs().isImperative().found) {
      issues.push(
        "Avoid commands in the Context. They belong in the Objective."
      );
    }
    return issues;
  },
  Objective: (text: string, doc: NlpDocument) => {
    const issues: string[] = [];
    const verbs = doc.verbs();
    if (!text) {
      issues.push("The Objective is crucial. Please define a clear goal.");
      return issues;
    }
    if (!verbs.isImperative().found) {
      issues.push(
        "The objective should be a clear command (e.g., 'Generate a list...')."
      );
    }
    const firstVerb = verbs.first().text("normal");
    if (GENERIC_VERBS.includes(firstVerb)) {
      const suggestions = [...STRONG_ACTION_VERBS]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .join(", ");
      issues.push(
        `Use a more specific verb than "${firstVerb}". Try: ${suggestions}.`
      );
    }
    return issues;
  },
  Constraints: (text: string, doc: NlpDocument) => {
    const issues: string[] = [];
    if (doc.match("#Negative").found) {
      issues.push(
        "Consider rephrasing negative constraints ('don't do X') as positive ones ('only do Y')."
      );
    }
    return issues;
  },
  Examples: (text: string, doc: NlpDocument) => {
    const issues: string[] = [];
    if (text && !text.toLowerCase().match(/e\.g\.|i\.e\.|for example/)) {
      issues.push('Good examples often start with "e.g.," or "For example,".');
    }
    return issues;
  },
  OutputFormat: (text: string, doc: NlpDocument) => {
    const issues: string[] = [];
    if (
      text &&
      !OUTPUT_FORMAT_KEYWORDS.some((kw) => text.toLowerCase().includes(kw))
    ) {
      issues.push(
        'Specify a clear format like "JSON," "Markdown," "bullet points," etc.'
      );
    }
    return issues;
  },
};
