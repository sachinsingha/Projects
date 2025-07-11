import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBrain } from "react-icons/fa";
import { Menu, X, Sun, Moon } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faTwitter,
  faLinkedin,
  faDiscord,
} from "@fortawesome/free-brands-svg-icons";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("sutraform-theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("sutraform-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const features = [
    {
      icon: <FaBrain className="text-purple-500 text-3xl" />,
      title: "AI-Powered Insights",
      desc: "Analyze responses using GPT: sentiment, keywords & summaries.",
    },
    {
      icon: <span className="text-3xl">⚡</span>,
      title: "Lightning Fast Builder",
      desc: "Drag-and-drop intuitive builder with smart field templates.",
    },
    {
      icon: <span className="text-3xl">👥</span>,
      title: "Team Collaboration",
      desc: "Invite team members with role-based editing & viewing.",
    },
    {
      icon: <span className="text-3xl">📊</span>,
      title: "Real-time Analytics",
      desc: "See form views, completions & export visual reports.",
    },
    {
      icon: <span className="text-3xl">📤</span>,
      title: "Easy Exports",
      desc: "Export to Notion, Sheets, Airtable, CSV, PDF & more.",
    },
    {
      icon: <span className="text-3xl">✨</span>,
      title: "Smart Suggestions",
      desc: "Get AI suggestions for next best questions to ask.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9f9ff] dark:bg-zinc-900 text-gray-900 dark:text-white flex flex-col transition-colors">
      {/* Header */}
      <header className="w-full bg-white dark:bg-zinc-800 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
{/* <img src="/sutra.png" alt="SutraForm Logo" className="h-10  w-20" /> */}
<h1 className="text-2xl font-bold text-purple-600">SutraForm</h1>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="hover:text-purple-600 dark:hover:text-purple-400">Features</a>
            <a href="#pricing" className="hover:text-purple-600 dark:hover:text-purple-400">Free</a>
            <button className="text-sm hover:text-purple-600 dark:hover:text-purple-400">Sign In/Login</button>
            <button onClick={toggleTheme} className="text-gray-700 dark:text-white">
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <Link to="/builder">
              <button className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
                Get Started
              </button>
            </Link>
          </nav>

          {/* Mobile Nav Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="text-gray-700 dark:text-white">
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white dark:bg-zinc-800 px-6 pb-4">
            <a href="#features" className="block py-2 hover:text-purple-600 dark:hover:text-purple-400">Features</a>
            <a href="#pricing" className="block py-2 hover:text-purple-600 dark:hover:text-purple-400">Pricing</a>
            <button className="block py-2 hover:text-purple-600 dark:hover:text-purple-400">Sign In</button>
            <Link to="/builder">
              <button className="mt-2 w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-medium">
                Get Started
              </button>
            </Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="text-center py-20 px-4 sm:px-6">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 bg-purple-100 dark:bg-purple-900 px-4 py-1 rounded-full">
          <FaBrain className="text-purple-500" />
          AI-Powered Form Intelligence
        </span>

        <h2 className="mt-6 text-4xl sm:text-5xl font-extrabold leading-tight">
          Build Smart Forms with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">
            AI Insights
          </span>
        </h2>

        <p className="mt-6 text-lg max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
          Create beautiful forms in minutes with drag-and-drop simplicity. Get AI-powered
          summaries, analytics, and integrations.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/builder">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold text-sm">
              Start Building Free →
            </button>
          </Link>
          <button className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 hover:border-gray-400 text-gray-700 dark:text-white px-6 py-3 rounded-lg font-semibold text-sm">
            Watch Demo
          </button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-white dark:bg-zinc-900">
        <h3 className="text-3xl font-bold text-center mb-12">Everything you need to build amazing forms</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-zinc-800 hover:bg-purple-50 dark:hover:bg-zinc-700 transition-all border border-gray-200 dark:border-zinc-700 p-6 rounded-xl shadow-sm"
            >
              <div className="mb-3">{feature.icon}</div>
              <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Ready to build your first intelligent form?
        </h2>
        <p className="mb-6 text-zinc-300">
          Join thousands of users who are already creating smarter forms with SutraForm.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded shadow hover:opacity-90 transition"
        >
          Start Building Now →
        </a>

        <div className="mt-8 flex justify-center gap-6 text-xl">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faGithub} className="text-white hover:text-purple-400 text-2xl" />

          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faTwitter} className="text-white hover:text-purple-400 text-2xl" />

          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faLinkedin} className="text-white hover:text-purple-400 text-2xl" />

          </a>
          <a href="https://discord.gg" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faDiscord} className="text-white hover:text-purple-400 text-2xl" />

          </a>
        </div>
      </div>

      <div className="bg-zinc-800 text-zinc-400 text-sm py-4 px-4 text-center">
        © 2025 SutraForm. Built with ⚡ AI power.
      </div>
    </footer>
    </div>
  );
}
