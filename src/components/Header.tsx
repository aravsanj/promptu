import GitHubIcon from "./icons/GitHub";

const Header = () => (
  <header className="text-center mb-8">
    <h1 className="text-4xl font-bold text-gray-100 inline-flex items-center">
      Promptu
      <span className="ml-2 text-xs font-semibold bg-blue-500/80 text-white px-2 py-1 rounded-full align-super">
        BETA
      </span>
    </h1>
    <p className="text-lg mt-2 text-gray-400">
      Structured prompts with linting support (in-browser)
    </p>

    <a
      href="https://github.com/aravsanj/promptu/issues"
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-flex items-center text-sm text-gray-500 hover:text-gray-300 transition-colors"
    >
      <GitHubIcon />
      Report an issue
    </a>
  </header>
);

export default Header;
