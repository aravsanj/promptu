export interface PromptConfig {
  name: string;
  role: string;
  context: string;
  objective: string;
  constraints: string;
  examples: string;
  outputFormat: string;
}

export const defaultExamples: PromptConfig[] = [
  {
    name: "React Component Refactor",
    role: "You are a senior React developer and an expert in state management and component architecture.",
    context: `The following React component requires refactoring. Its current implementation does not handle loading or error states when fetching data.
\`\`\`javascript
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
\`\`\``,
    objective:
      "Rewrite the component to correctly manage and display loading and error states during the API call, and also handle the case where the user is not found.",
    constraints:
      "Use only the `useState` and `useEffect` hooks. The solution must rely exclusively on built-in React capabilities. The final code must be production-ready with comments explaining the logic.",
    examples:
      "For example, introduce a state variable for status which will be 'idle', 'loading', 'success', or 'error'.",
    outputFormat:
      "Return only the complete, refactored JSX code inside a single markdown block. Do not add any explanatory text outside of the code comments.",
  },
  {
    name: "UX Feedback Synthesizer",
    role: "You are a Senior UX Researcher tasked with analyzing and synthesizing qualitative user feedback to inform product decisions.",
    context: `The following is raw, anonymized user feedback for a new "Team Dashboard" feature in our project management app:
- "I love the new charts, it's so easy to see our progress at a glance."
- "Finding the button to add a new team member was  difficult."
- "The page loads so slowly when we have more than 5 projects."
- "The drag-and-drop for tasks is a game-changer! So much better than before."
- "I must be able to filter the dashboard by date range. I had to export everything to a spreadsheet to do this."
- "The color scheme is very pleasant and modern."`,
    objective:
      "Synthesize the feedback into key themes. Identify the top 3 user pain points and the top 2 most-praised features. Provide one actionable recommendation for each pain point.",
    constraints:
      "Focus on user goals and frustrations. Recommendations must be high-level (e.g., 'Improve discoverability of user management features') more than specific UI suggestions (e.g., 'Make the button green').",
    examples:
      "For example, a pain point is 'Poor performance with large datasets' and a praised feature is 'Intuitive task management interactions'.",
    outputFormat:
      "Generate a report in Markdown format. Use H2 headings for 'Praised Features', 'User Pain Points', and 'Actionable Recommendations'. Use a numbered list for each section.",
  },
  {
    name: "SEO Content Strategist",
    role: "You are an expert SEO Content Strategist creating a content plan to improve search engine rankings for a local business.",
    context:
      "The business is a new specialty coffee shop in Varkala, Kerala, that sells artisanal, locally-sourced coffee beans. The target audience is tourists and local residents who value high-quality coffee.",
    objective:
      "Generate a content plan with 4 blog post ideas designed to attract the target audience through organic search. For each idea, provide a catchy title, the primary SEO keyword, two related secondary keywords, and a brief 1-2 sentence summary of the article's angle.",
    constraints:
      "Keywords must have high purchase or visit intent. Titles must be engaging. The tone must be relaxed and authentic, matching the Varkala beach vibe.",
    examples:
      "For example, a title must be 'The Ultimate Guide to Varkala's Coffee Scene' with the primary keyword 'coffee in Varkala'.",
    outputFormat:
      "Present the content plan as a numbered list. For each item, use bolding for 'Title:', 'Primary Keyword:', 'Secondary Keywords:', and 'Summary:'.",
  },
  {
    name: "SQL Query Generator",
    role: "You are an expert Data Analyst specializing in SQL. You write clean, efficient, and well-documented queries.",
    context: `You are working with a database that has the following schema for an e-commerce platform:
- users (id, name, email, signup_date)
- orders (id, user_id, order_date, total_amount)
- products (id, name, price)`,
    objective:
      "Generate a SQL query that finds the top 5 customers by total spending in the last 90 days. Include the customer's full name, email, and their total purchase amount, aliased as 'total_spent'.",
    constraints:
      "The query must be compatible with PostgreSQL. The total purchase amount must be formatted as a numeric type with two decimal places. The results must be ordered from highest to lowest total spent.",
    examples:
      "For example, a join between the 'users' and 'orders' tables would be on 'users.id = orders.user_id'.",
    outputFormat:
      "Return only the complete SQL query inside a single markdown code block. Do not include any explanation of how the query works.",
  },
  {
    name: "Vague Social Media Post (Linter Test)",
    role: "Can you be a social media expert?",
    context:
      "Basically, our coffee shop in Varkala is really cool. Just tell everyone it has a sort of beach vibe.",
    objective: "My goal is to get a good post for Instagram.",
    constraints: "Don't make it too long and don't use boring words.",
    examples: "A post might talk about our special cold brew.",
    outputFormat: "Give me some text for the post.",
  },
];

export const HEDGING_WORDS: string[] = [
  "a bit",
  "a little",
  "almost",
  "apparently",
  "appear",
  "around",
  "basically",
  "can",
  "could",
  "essentially",
  "fairly",
  "hopefully",
  "in a sense",
  "in my opinion",
  "just",
  "kind of",
  "largely",
  "likely",
  "mainly",
  "may",
  "maybe",
  "might",
  "mostly",
  "often",
  "overall",
  "perhaps",
  "possibly",
  "pretty",
  "probably",
  "quite",
  "rather",
  "really",
  "relatively",
  "roughly",
  "seems",
  "should",
  "sometimes",
  "somewhat",
  "sort of",
  "suggests",
  "supposedly",
  "tend to",
  "typically",
];

export const GENERIC_VERBS: string[] = [
  "be",
  "do",
  "get",
  "give",
  "go",
  "have",
  "make",
  "put",
  "say",
  "see",
  "take",
];

export const STRONG_ACTION_VERBS: string[] = [
  "act as",
  "analyze",
  "assess",
  "brainstorm",
  "build",
  "classify",
  "compare",
  "compose",
  "contrast",
  "convert",
  "create",
  "critique",
  "debug",
  "define",
  "design",
  "develop",
  "diagnose",
  "draft",
  "edit",
  "evaluate",
  "explain",
  "extract",
  "format",
  "generate",
  "identify",
  "illustrate",
  "improve",
  "interpret",
  "invent",
  "list",
  "optimize",
  "outline",
  "paraphrase",
  "predict",
  "proofread",
  "propose",
  "rank",
  "rate",
  "refactor",
  "refine",
  "rephrase",
  "restate",
  "rewrite",
  "simplify",
  "solve",
  "structure",
  "suggest",
  "summarize",
  "synthesize",
  "trace",
  "transcribe",
  "transform",
  "translate",
];

export const OUTPUT_FORMAT_KEYWORDS: string[] = [
  "array",
  "article",
  "blog post",
  "bullet points",
  "chart",
  "code block",
  "csv",
  "email",
  "essay",
  "html",
  "javascript",
  "json",
  "json object",
  "list",
  "markdown",
  "numbered list",
  "object",
  "paragraph",
  "poem",
  "python",
  "report",
  "script",
  "sql",
  "table",
  "text",
  "typescript",
  "xml",
  "yaml",
];
