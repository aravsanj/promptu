import { useState, useEffect } from "react";
import nlp from "compromise";
import { LINTING_RULES } from "../constants/prompt.constants";
import { HEDGING_WORDS, defaultExamples } from "../constants/word.constants";
import type { PromptConfig } from "../constants/word.constants";
import Header from "./Header";
import Footer from "./Footer";
import ExampleDropdown from "./ExampleDropDown";

const inputStyles =
  "w-full p-2 bg-black/30 text-gray-200 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition";
const buttonStyles =
  "px-4 py-2 cursor-pointer bg-gray-800/80 text-gray-200 border border-white/10 rounded-lg hover:bg-gray-700/80 transition shadow-md";

interface PromptState {
  role: string;
  context: string;
  objective: string;
  constraints: string;
  examples: string;
  outputFormat: string;
}

const initialPromptState: PromptState = {
  role: "",
  context: "",
  objective: "",
  constraints: "",
  examples: "",
  outputFormat: "",
};

export default function PromptWorkspace() {
  const [prompt, setPrompt] = useState<PromptState>(initialPromptState);
  const [savedPrompts, setSavedPrompts] = useState<PromptConfig[]>([]);
  const [feedback, setFeedback] = useState<Record<string, string[]>>({});
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [codeBlockContent, setCodeBlockContent] = useState<string>("");
  const [codeLanguage, setCodeLanguage] = useState<string>("javascript");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editablePrompt, setEditablePrompt] = useState<string>("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("promptData") || "null");
    if (stored) {
      setPrompt(stored);
    }
    const saved = JSON.parse(localStorage.getItem("myPrompts") || "[]");
    setSavedPrompts(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("promptData", JSON.stringify(prompt));
  }, [prompt]);

  useEffect(() => {
    const allFeedback: Record<string, string[]> = {};
    const fields = {
      Role: prompt.role,
      Context: prompt.context,
      Objective: prompt.objective,
      Constraints: prompt.constraints,
      Examples: prompt.examples,
      "Output Format": prompt.outputFormat,
    };

    for (const [name, text] of Object.entries(fields)) {
      const doc = nlp(text);
      let issues: string[] = [];
      const rule = LINTING_RULES[name as keyof typeof LINTING_RULES];
      if (rule) {
        issues = issues.concat(rule(text, doc));
      }
      HEDGING_WORDS.forEach((phrase: string) => {
        if (doc.has(phrase)) {
          issues.push(`Avoid vague language like "${phrase}".`);
        }
      });
      allFeedback[name] = Array.from(new Set(issues));
    }
    setFeedback(allFeedback);
  }, [prompt]);

  const finalPrompt = `
Role: ${prompt.role}

Context: ${prompt.context}

Objective: ${prompt.objective}

Constraints: ${prompt.constraints}

Examples: ${prompt.examples}

Output Format: ${prompt.outputFormat}
  `.trim();

  const tokenCount = finalPrompt.split(/\s+/).filter(Boolean).length;
  const charCount = finalPrompt.length;

  const handlePromptChange = (field: keyof PromptState, value: string) => {
    setPrompt((prev) => ({ ...prev, [field]: value }));
  };

  const loadPrompt = (p: PromptConfig) => {
    setPrompt({
      role: p.role,
      context: p.context,
      objective: p.objective,
      constraints: p.constraints,
      examples: p.examples,
      outputFormat: p.outputFormat,
    });
  };

  const savePrompt = () => {
    const name = window.prompt("Enter a name for this prompt:");
    if (!name) return;
    const newPrompt: PromptConfig = { name, ...prompt };
    const updated = [...savedPrompts, newPrompt];
    setSavedPrompts(updated);
    localStorage.setItem("myPrompts", JSON.stringify(updated));
  };

  const copyToClipboard = () => navigator.clipboard.writeText(finalPrompt);

  const copyAsMarkdown = () => {
    const markdownPrompt = Object.entries(prompt)
      .map(
        ([key, value]) =>
          `## ${key.charAt(0).toUpperCase() + key.slice(1)}\n${value}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(markdownPrompt.trim());
  };

  const handleSaveCodeblock = () => {
    if (!codeBlockContent) return;
    const formattedCodeBlock = `\n\n\`\`\`${
      codeLanguage || " "
    }\n${codeBlockContent}\n\`\`\`\n`;
    handlePromptChange("context", prompt.context + formattedCodeBlock);
    setCodeBlockContent("");
    setIsCodeModalOpen(false);
  };

  const handleSaveEditedPrompt = () => {
    const sections: (keyof PromptState)[] = [
      "role",
      "context",
      "objective",
      "constraints",
      "examples",
      "outputFormat",
    ];
    const sectionTitles = sections.map(
      (s) => s.charAt(0).toUpperCase() + s.slice(1)
    );

    for (let i = 0; i < sectionTitles.length; i++) {
      const currentSection = sectionTitles[i];
      const nextSection = sectionTitles[i + 1];
      let content = "";

      if (nextSection) {
        const pattern = new RegExp(
          `${currentSection}:(.*?)${nextSection}:`,
          "s"
        );
        const match = editablePrompt.match(pattern);
        content = match ? match[1].trim() : "";
      } else {
        const pattern = new RegExp(`${currentSection}:(.*)`, "s");
        const match = editablePrompt.match(pattern);
        content = match ? match[1].trim() : "";
      }
      handlePromptChange(sections[i], content);
    }
    setIsEditModalOpen(false);
  };

  return (
    <>
      {isCodeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
            <h3 className="text-xl text-white font-semibold mb-4">
              Add Code Block
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Language
              </label>
              <input
                type="text"
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className={`${inputStyles} h-10`}
                placeholder="javascript"
              />
            </div>
            <textarea
              className={`${inputStyles} font-mono`}
              rows={10}
              value={codeBlockContent}
              onChange={(e) => setCodeBlockContent(e.target.value)}
              placeholder="Paste your code here..."
            />
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setIsCodeModalOpen(false)}
                className={buttonStyles}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCodeblock}
                className={`${buttonStyles} bg-blue-600 hover:bg-blue-500`}
              >
                Save Code
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-3xl shadow-2xl">
            <h3 className="text-xl text-white font-semibold mb-4">
              Edit Final Prompt
            </h3>
            <textarea
              className={`${inputStyles} font-mono`}
              rows={15}
              value={editablePrompt}
              onChange={(e) => setEditablePrompt(e.target.value)}
            />
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className={buttonStyles}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditedPrompt}
                className={`${buttonStyles} bg-blue-600 hover:bg-blue-500`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-black bg-gradient-to-br from-gray-900 via-black to-blue-900/30 text-gray-200 p-6 font-sans flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="mb-4">
                <label className="block font-medium mb-2 text-gray-400">
                  Load Example
                </label>
                <ExampleDropdown
                  items={defaultExamples}
                  onChange={(p) => loadPrompt(p)}
                />
              </div>

              {Object.entries(prompt).map(([key, value]) => {
                const fieldLabel = key.charAt(0).toUpperCase() + key.slice(1);
                return (
                  <div key={key} className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-medium text-gray-400">
                        {fieldLabel}
                      </label>
                      {key === "context" && (
                        <button
                          onClick={() => setIsCodeModalOpen(true)}
                          className="text-xs px-2 py-1 bg-gray-700/50 rounded hover:bg-gray-600/50 transition"
                        >
                          + Add Codeblock
                        </button>
                      )}
                    </div>
                    <textarea
                      className={inputStyles}
                      rows={key === "context" ? 4 : 2}
                      value={value}
                      onChange={(e) =>
                        handlePromptChange(
                          key as keyof PromptState,
                          e.target.value
                        )
                      }
                    />
                  </div>
                );
              })}

              <div className="mb-6 flex gap-3">
                <button onClick={savePrompt} className={buttonStyles}>
                  Save Prompt
                </button>
                <select
                  onChange={(e) => {
                    const selected = savedPrompts.find(
                      (sp) => sp.name === e.target.value
                    );
                    if (selected) loadPrompt(selected);
                  }}
                  className={`${inputStyles} flex-1`}
                >
                  <option value="">Load Saved Prompt...</option>
                  {savedPrompts.map((sp) => (
                    <option key={sp.name} value={sp.name}>
                      {sp.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col">
              <div className="mb-2 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Final Prompt</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditablePrompt(finalPrompt);
                      setIsEditModalOpen(true);
                    }}
                    className={buttonStyles}
                  >
                    Edit
                  </button>
                  <button onClick={copyAsMarkdown} className={buttonStyles}>
                    Copy MD
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className={`${buttonStyles} bg-blue-600 hover:bg-blue-500`}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <pre
                className={`${inputStyles} whitespace-pre-wrap break-words flex-grow min-h-[200px]`}
              >
                {finalPrompt}
              </pre>
              <div className="text-sm text-gray-500 mt-2">
                {tokenCount} tokens • {charCount} characters
              </div>
              <div className="mt-6">
                <h3 className="font-semibold mb-3 text-gray-400">
                  Prompt Linter Feedback
                </h3>
                {(() => {
                  const allIssues = Object.entries(feedback).filter(
                    ([, issues]) => issues.length > 0
                  );
                  if (allIssues.length === 0) {
                    return (
                      <p className="text-green-400/80">No issues detected ✅</p>
                    );
                  }
                  return (
                    <div className="space-y-4">
                      {allIssues.map(([label, issues]) => (
                        <div key={label}>
                          <h4 className="font-semibold text-gray-300">
                            {label}
                          </h4>
                          <ul className="list-disc ml-5 text-yellow-400/80 space-y-1 mt-1 text-sm">
                            {issues.map((issue, i) => (
                              <li key={i}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
