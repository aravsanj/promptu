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
  </header>
);

export default Header;
