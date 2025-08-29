import { useState, useEffect } from "react";
import nlp from "compromise";
import { LINTING_RULES } from "../constants/prompt.constants";
import { HEDGING_WORDS, defaultExamples } from "../constants/word.constants";
import type { PromptConfig } from "../constants/word.constants";
import Header from "./Header";
import Footer from "./Footer";
import Dropdown from "./DropDown";

const inputStyles =
  "w-full p-2 bg-black/30 text-gray-200 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition";
const buttonStyles =
  "px-4 py-2 cursor-pointer bg-gray-800/80 text-gray-200 border border-white/10 rounded-lg hover:bg-gray-700/80 transition shadow-md";

interface CodeBlock {
  id: string;
  language: string;
  content: string;
}

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

const parseFullContext = (fullText: string) => {
  const codeBlocks: CodeBlock[] = [];
  let remainingText = fullText || "";
  const codeBlockRegex = /\n*```(\w*)\n([\s\S]*?)\n```/g;

  const matches = Array.from(remainingText.matchAll(codeBlockRegex));

  matches.forEach((match) => {
    const id = `codeblock-${Math.random().toString(36).substring(2, 9)}`;
    codeBlocks.push({
      id,
      language: match[1] || "text",
      content: match[2],
    });
  });

  remainingText = remainingText.replace(codeBlockRegex, "").trim();

  return { textContent: remainingText, codeBlocks };
};

const stripCodeBlocks = (text: string) => {
  if (!text) return "";
  const codeBlockRegex = /\n*```(\w*)\n([\s\S]*?)\n```/g;
  return text.replace(codeBlockRegex, "");
};

export default function PromptWorkspace() {
  const [prompt, setPrompt] = useState<PromptState>(initialPromptState);
  const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([]);
  const [savedPrompts, setSavedPrompts] = useState<PromptConfig[]>([]);
  const [feedback, setFeedback] = useState<Record<string, string[]>>({});
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [codeBlockContent, setCodeBlockContent] = useState<string>("");
  const [codeLanguage, setCodeLanguage] = useState<string>("javascript");
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editablePrompt, setEditablePrompt] = useState<string>("");
  const [selectedExample, setSelectedExample] = useState<string>("");
  const [selectedSavedPrompt, setSelectedSavedPrompt] = useState<string>("");

  const getFullContext = () => {
    const codeBlocksText = codeBlocks
      .map((block) => `\n\n\`\`\`${block.language}\n${block.content}\n\`\`\``)
      .join("");
    return (prompt.context + codeBlocksText).trim();
  };

  useEffect(() => {
    const storedData = localStorage.getItem("promptData");
    if (storedData) {
      const storedPrompt = JSON.parse(storedData);
      const { textContent, codeBlocks } = parseFullContext(
        storedPrompt.context || ""
      );
      setPrompt({ ...storedPrompt, context: textContent });
      setCodeBlocks(codeBlocks);
    }
    const saved = JSON.parse(localStorage.getItem("myPrompts") || "[]");
    setSavedPrompts(saved);
  }, []);

  useEffect(() => {
    const fullPromptState = { ...prompt, context: getFullContext() };
    localStorage.setItem("promptData", JSON.stringify(fullPromptState));
  }, [prompt, codeBlocks]);

  useEffect(() => {
    const allFeedback: Record<string, string[]> = {};
    const fullContext = getFullContext();
    const fields = {
      Role: prompt.role,
      Context: fullContext,
      Objective: prompt.objective,
      Constraints: prompt.constraints,
      Examples: prompt.examples,
      "Output Format": prompt.outputFormat,
    };

    for (const [name, text] of Object.entries(fields)) {
      const textWithoutCode = stripCodeBlocks(text);

      const doc = nlp(textWithoutCode);

      let issues: string[] = [];
      const rule = LINTING_RULES[name as keyof typeof LINTING_RULES];

      if (rule) {
        issues = issues.concat(rule(text, doc));
      }

      const hedgingDoc = nlp(textWithoutCode);
      HEDGING_WORDS.forEach((phrase: string) => {
        if (hedgingDoc.has(phrase)) {
          issues.push(`Avoid vague language like "${phrase}".`);
        }
      });
      allFeedback[name] = Array.from(new Set(issues));
    }
    setFeedback(allFeedback);
  }, [prompt, codeBlocks]);

  const finalPrompt = `
Role: ${prompt.role}

Context: ${getFullContext()}

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
    const { textContent, codeBlocks } = parseFullContext(p.context || "");
    setPrompt({
      role: p.role,
      context: textContent,
      objective: p.objective,
      constraints: p.constraints,
      examples: p.examples,
      outputFormat: p.outputFormat,
    });
    setCodeBlocks(codeBlocks);
  };

  const savePrompt = () => {
    const name = window.prompt("Enter a name for this prompt:");
    if (!name) return;
    const newPrompt: PromptConfig = {
      name,
      ...prompt,
      context: getFullContext(),
    };
    const updated = [...savedPrompts, newPrompt];
    setSavedPrompts(updated);
    localStorage.setItem("myPrompts", JSON.stringify(updated));
  };

  const copyToClipboard = () => navigator.clipboard.writeText(finalPrompt);

  const copyAsMarkdown = () => {
    const markdownPrompt = Object.entries({
      ...prompt,
      context: getFullContext(),
    })
      .map(
        ([key, value]) =>
          `## ${key.charAt(0).toUpperCase() + key.slice(1)}\n${value}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(markdownPrompt.trim());
  };

  const handleAddNewCodeBlock = () => {
    const newId = `codeblock-${Math.random().toString(36).substring(2, 9)}`;
    const newBlock = { id: newId, language: "javascript", content: "" };
    setCodeBlocks([...codeBlocks, newBlock]);
    setEditingBlockId(newId);
    setCodeBlockContent("");
    setCodeLanguage("javascript");
    setIsCodeModalOpen(true);
  };

  const handleEditCodeBlock = (blockId: string) => {
    const block = codeBlocks.find((b) => b.id === blockId);
    if (block) {
      setEditingBlockId(block.id);
      setCodeBlockContent(block.content);
      setCodeLanguage(block.language);
      setIsCodeModalOpen(true);
    }
  };

  const handleSaveCodeblock = () => {
    if (!editingBlockId) return;
    setCodeBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === editingBlockId
          ? { ...block, content: codeBlockContent, language: codeLanguage }
          : block
      )
    );
    setIsCodeModalOpen(false);
    setEditingBlockId(null);
  };

  const handleDeleteCodeBlock = () => {
    if (!editingBlockId) return;
    if (window.confirm("Are you sure you want to delete this code block?")) {
      setCodeBlocks((prevBlocks) =>
        prevBlocks.filter((block) => block.id !== editingBlockId)
      );
      setIsCodeModalOpen(false);
      setEditingBlockId(null);
    }
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
    const tempPrompt: { [key: string]: string } = {};

    let remainingText = editablePrompt;

    for (let i = 0; i < sections.length; i++) {
      const currentSection = sections[i];
      const nextSection = i + 1 < sections.length ? sections[i + 1] : null;

      const currentTitle =
        currentSection.charAt(0).toUpperCase() + currentSection.slice(1);
      const nextTitle = nextSection
        ? nextSection.charAt(0).toUpperCase() + nextSection.slice(1)
        : null;

      const startIndex = remainingText.indexOf(currentTitle + ":");
      if (startIndex === -1) continue;

      let endIndex;
      if (nextTitle) {
        endIndex = remainingText.indexOf(nextTitle + ":", startIndex);
      }

      const contentWithTitle =
        endIndex === -1 || !nextTitle
          ? remainingText.substring(startIndex)
          : remainingText.substring(startIndex, endIndex);
      tempPrompt[currentSection] = contentWithTitle
        .substring(currentTitle.length + 1)
        .trim();
    }

    const { textContent, codeBlocks } = parseFullContext(
      tempPrompt.context || ""
    );
    const finalParsedPrompt = {
      role: tempPrompt.role || "",
      context: textContent,
      objective: tempPrompt.objective || "",
      constraints: tempPrompt.constraints || "",
      examples: tempPrompt.examples || "",
      outputFormat: tempPrompt.outputFormat || "",
    };

    setPrompt(finalParsedPrompt);
    setCodeBlocks(codeBlocks);
    setIsEditModalOpen(false);
  };

  return (
    <>
      {isCodeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
            <h3 className="text-xl text-white font-semibold mb-4">
              Edit Code Block
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
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handleDeleteCodeBlock}
                className={`${buttonStyles} bg-red-800/70 hover:bg-red-700`}
              >
                Delete
              </button>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setIsCodeModalOpen(false);
                    setEditingBlockId(null);
                  }}
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
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-3xl shadow-2xl">
            <h3 className="text-xl text-white font-semibold mb-4">
              Edit Final Prompt
            </h3>
            <div className="flex items-center mb-2 p-3 text-sm text-yellow-300 bg-yellow-900/50 rounded-lg">
              <svg
                className="w-5 h-5 mr-3 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>
                Editing here might be destructive in the UI, so make sure your
                prompt is final.
              </span>
            </div>
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
                <Dropdown
                  items={defaultExamples}
                  value={selectedExample}
                  placeholder="Select an example..."
                  getValue={(ex) => ex.name}
                  getLabel={(ex) => ex.name}
                  onChange={(selected) => {
                    loadPrompt(selected);
                    setSelectedExample(selected.name);
                    setSelectedSavedPrompt("");
                  }}
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
                          onClick={handleAddNewCodeBlock}
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
                    {key === "context" && (
                      <div className="mt-2 space-y-2">
                        {codeBlocks.map((block) => (
                          <button
                            key={block.id}
                            onClick={() => handleEditCodeBlock(block.id)}
                            className="w-full text-left text-sm px-3 py-2 bg-gray-700/60 border border-white/10 rounded-md hover:bg-gray-600/60 transition shadow-sm"
                          >
                            View/Edit Code ({block.language},{" "}
                            {block.content.split("\n").length} lines)
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="mb-6 flex items-center gap-3">
                <button onClick={savePrompt} className={buttonStyles}>
                  Save Prompt
                </button>
                <Dropdown
                  items={savedPrompts}
                  value={selectedSavedPrompt}
                  placeholder="Load Saved Prompt..."
                  getValue={(sp) => sp.name}
                  getLabel={(sp) => sp.name}
                  onChange={(selected) => {
                    loadPrompt(selected);
                    setSelectedSavedPrompt(selected.name);
                    setSelectedExample("");
                  }}
                  className="flex-1"
                />
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

              <div
                className={`${inputStyles} whitespace-pre-wrap break-words h-[350px] overflow-y-auto p-4`}
              >
                <p>
                  <strong>Role:</strong> {prompt.role}
                </p>
                <div className="my-4">
                  <p>
                    <strong>Context:</strong> {prompt.context}
                  </p>
                  <div className="mt-2 space-y-2">
                    {codeBlocks.map((block) => (
                      <button
                        key={block.id}
                        onClick={() => handleEditCodeBlock(block.id)}
                        className="w-full text-left text-sm px-3 py-2 bg-gray-700/30 border border-white/5 rounded-md hover:bg-gray-600/30 transition shadow-sm"
                      >
                        View/Edit Code ({block.language},{" "}
                        {block.content.split("\n").length} lines)
                      </button>
                    ))}
                  </div>
                </div>
                <p>
                  <strong>Objective:</strong> {prompt.objective}
                </p>
                <p className="my-4">
                  <strong>Constraints:</strong> {prompt.constraints}
                </p>
                <p>
                  <strong>Examples:</strong> {prompt.examples}
                </p>
                <p className="mt-4">
                  <strong>Output Format:</strong> {prompt.outputFormat}
                </p>
              </div>

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
