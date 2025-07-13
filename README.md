# SutraForm 🚀

SutraForm is a modern, AI-powered form builder that lets you create beautiful, intelligent forms with ease. From drag-and-drop editing to GPT-based field generation and smart analytics, SutraForm streamlines the entire form creation and response management experience.

## ✨ Features

- 🔮 **AI-Powered Field Generation** — Describe your form idea, and GPT suggests fields.
- 🧠 **AI Response Insights** — Summarize, analyze sentiment, and extract keywords.
- 🧩 **Drag-and-Drop Builder** — Build forms effortlessly with a beautiful interface.
- 📊 **Real-time Analytics** — Track submissions, views, and engagement.
- 📁 **Easy Exports** — Download results in CSV, PDF, or integrate with Notion, Sheets, etc.
- 🌗 **Dark Mode Support** — Modern UI with light and dark themes.
- 🛡️ **Secure Backend** — JWT authentication and MongoDB storage.

---

## 🛠️ Tech Stack

### Frontend
- **React 19 + Vite** ⚛️
- **TailwindCSS 3**
- **Lucide + FontAwesome Icons**
- **React Router v7**

### Backend
- **Node.js + Express**
- **MongoDB + Mongoose**
- **OpenRouter API** (for GPT integration)
- **json2csv** for CSV exports
- **dotenv, cors, axios** for environment and HTTP handling

---

## 🚀 Getting Started

### 🔧 Prerequisites

- Node.js `>=18.x`
- MongoDB (local or cloud)
- OpenRouter API Key (for AI functionality)

### 📦 Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-username/sutraform.git
cd sutraform

# 2. Install backend dependencies
cd server
npm install

# 3. Install frontend dependencies
cd ../client
npm install
