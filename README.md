# Promptu (Beta)

**Craft, analyze, and perfect your AI prompts with a real-time, in-browser linter.**

Promptu is a client-side tool designed for everyone who want to build structured, effective prompts. It provides a guided interface and instant feedback to help you avoid common pitfalls and create prompts that get better results.

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## Features

- **📝 Structured Prompting:** Guides you through defining a Role, Context, Objective, Constraints, Examples, and Output Format.
- **🧠 Real-time Linting:** Uses the `compromise.js` NLP library to provide instant feedback on each part of your prompt, flagging vague language, weak verbs, and more.
- **💻 Code Block Support:** Easily add formatted code blocks to your prompt's context via a simple modal.
- **💾 Local Storage:** Saves your current prompt and a library of named prompts directly in your browser—no backend needed.
- **✂️ Multiple Copy Formats:** Copy the final prompt as plain text or formatted Markdown.
- **✏️ Full Edit Capability:** A modal allows you to freely edit the complete, compiled prompt before use.
- **🌐 100% Client-Side:** Your data never leaves your browser, ensuring complete privacy.

---

## Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

You will need [Node.js](https://nodejs.org/) (version 16 or later) and `npm` or `yarn` installed on your machine.

### Installation & Setup

1.  **Clone the repository:**

    ```sh
    git clone [https://github.com/aravsanj/promptu.git](https://github.com/aravsanj/promptu.git)
    ```

2.  **Navigate to the project directory:**

    ```sh
    cd promptu
    ```

3.  **Install dependencies:**

    ```sh
    npm install
    ```

    or if you use yarn:

    ```sh
    yarn install
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    or
    ```sh
    yarn dev
    ```

The application should now be running on `http://localhost:5173` (or another port if 5173 is in use).

---

## How to Use

1.  **Fill out the fields** on the left panel to structure your prompt.
2.  **Observe the feedback** on the right panel as the linter analyzes your input in real-time.
3.  **(Optional)** Use the **+ Add Codeblock** button in the `Context` field to paste and format code.
4.  Once satisfied, use the buttons on the right to **Copy**, **Copy as MD**, or **Edit** the final prompt.
5.  Use the **Save Prompt** button to store your work in the browser for later use.

---

## Tech Stack

- **Framework:** [React](https://reactjs.org/) (with Vite)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Natural Language Processing:** [Compromise.js](https://compromise.cool/)

---

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
