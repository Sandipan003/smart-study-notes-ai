# 🧠 StudyGenius AI — Smart Study Notes Generator

<div align="center">

![StudyGenius AI Banner](https://img.shields.io/badge/StudyGenius%20AI-Smart%20Study%20Notes-6366f1?style=for-the-badge&logo=sparkles&logoColor=white)
![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini%202.0-00f5d4?style=for-the-badge&logo=google&logoColor=white)
![React](https://img.shields.io/badge/React%2018-Frontend-61dafb?style=for-the-badge&logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-Backend-ec4899?style=for-the-badge&logo=flask&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**Transform your PDFs and lecture notes into AI-powered summaries, interactive 3D flashcards, and gamified quizzes — instantly.**

[🚀 Live Demo](#) · [📖 Documentation](#documentation) · [🐛 Report Bug](https://github.com/Sandipan003/smart-study-notes-ai/issues) · [💡 Request Feature](https://github.com/Sandipan003/smart-study-notes-ai/issues)

</div>

---

## 📸 Preview

| Hero Landing | Upload Zone | Flashcards |
|:---:|:---:|:---:|
| Animated cosmic hero with feature cards | 3D drag-and-drop upload zone | Real 3D flip cards with mastery tracking |

---

## ✨ Features

### 🤖 AI-Powered Generation
- **Smart Summary** — Extracts and structures key concepts, formulas, and definitions into clean markdown
- **Interactive Flashcards** — AI generates 5–10 high-quality concept/explanation card pairs
- **Multiple-Choice Quiz** — AI creates 5–8 MCQ questions with detailed explanations per answer

### 🎨 3D Modern UI
- **Cosmic dark theme** with animated floating orbs and CSS grid overlay
- **Glassmorphism 2.0** — multi-layer blur, rainbow gradient borders
- **Real 3D flashcard flip** — CSS `perspective` + `rotateY` + `backface-visibility`
- **Animated SVG score ring** with confetti burst on high quiz scores
- **Space Grotesk + Inter** premium typography from Google Fonts

### 📱 Mobile-First Responsive
- Fully fluid layouts from 375px → 1440px+
- Touch-friendly card navigation
- Collapsible history drawer with overlay
- Responsive tabs and upload zones

### 🗄️ Supabase Database Sync
- Auto-saves generated study guides to Supabase
- Browse and reload past study sessions from history drawer
- AI Tutor conversation history persisted per guide

### 🧑‍🏫 AI Tutor Chat
- Context-aware chatbot grounded in your uploaded notes
- Suggested question prompts for quick interaction
- Typing indicator with animated dots

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite 5, Vanilla CSS |
| **Backend** | Python, Flask, Flask-CORS |
| **AI Engine** | Google Gemini 2.0 Flash API |
| **PDF Extraction** | PyMuPDF (fitz), pypdf |
| **OCR Fallback** | Gemini Vision API (for scanned PDFs) |
| **Database** | Supabase (PostgreSQL via REST API) |
| **Deployment** | Vercel (frontend + backend) |
| **Icons** | Lucide React |
| **Fonts** | Google Fonts — Space Grotesk, Inter, Outfit |

---

## 🏗️ Project Structure

```
smart-study-notes-ai/
│
├── 📁 src/                          # React frontend
│   ├── 📁 components/
│   │   ├── UploadArea.jsx           # 3D drag-and-drop upload zone
│   │   ├── SummaryView.jsx          # Markdown summary + AI Tutor chat
│   │   ├── FlashcardsView.jsx       # 3D flip card deck with mastery tracking
│   │   ├── QuizView.jsx             # Gamified MCQ quiz + animated results
│   │   └── SettingsPanel.jsx        # (Deprecated — key is hardcoded)
│   ├── App.jsx                      # Main app shell, routing, state
│   ├── index.css                    # Full 3D design system & tokens
│   └── main.jsx                     # React entry point
│
├── 📁 backend/
│   ├── app.py                       # Flask API — generate, save, chat routes
│   ├── requirements.txt             # Python dependencies
│   ├── vercel.json                  # Backend Vercel deployment config
│   └── .env                         # API keys (not committed)
│
├── index.html                       # SEO-optimized HTML entry
├── vite.config.js                   # Vite 5 configuration
├── package.json                     # Frontend dependencies
└── vercel.json                      # Frontend Vercel SPA routing
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ (v20 recommended)
- **Python** 3.9+
- **Google Gemini API Key** — [Get one free here](https://aistudio.google.com/app/apikey)
- **Supabase Project** (optional, for history sync) — [supabase.com](https://supabase.com)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Sandipan003/smart-study-notes-ai.git
cd smart-study-notes-ai
```

---

### 2️⃣ Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → Opens at http://localhost:5173
```

---

### 3️⃣ Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your keys (see Configuration section)

# Start Flask server
python app.py
# → Runs at http://localhost:5001
```

---

### 4️⃣ Configuration

Create `backend/.env` with these values:

```env
# Google Gemini API Key (required)
# Get yours free at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase (optional — for history sync)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
```

> **Note:** A default API key is hardcoded in the app for demo purposes. For production, always use your own key.

---

### 5️⃣ Supabase Database Setup (Optional)

If you want history sync, run this SQL in your Supabase SQL Editor:

```sql
-- Study guides table
CREATE TABLE study_guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  flashcards JSONB DEFAULT '[]',
  quiz JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat history table
CREATE TABLE chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guide_id UUID REFERENCES study_guides(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional, for production)
ALTER TABLE study_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
```

---

## 🌐 Deployment on Vercel

### Frontend

1. Push code to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Set **Framework Preset** → Vite
4. Set **Build Command** → `npm run build`
5. Set **Output Directory** → `dist`
6. Add environment variable:
   - `VITE_BACKEND_URL` = your backend Vercel URL

### Backend (Serverless Python)

1. In Vercel dashboard → **Add New Project** → import same repo
2. Set **Root Directory** → `backend`
3. Add environment variables:
   - `GEMINI_API_KEY` = your Gemini API key
   - `SUPABASE_URL` = your Supabase URL
   - `SUPABASE_KEY` = your Supabase key

> The `backend/vercel.json` handles routing all requests to `app.py` automatically.

---

## 📡 API Reference

### `GET /api/health`
Returns server status and configuration flags.

```json
{
  "status": "healthy",
  "engine_env_configured": true,
  "supabase_configured": true
}
```

---

### `POST /api/generate`
Upload a PDF file to extract text and generate study material.

| Field | Type | Description |
|-------|------|-------------|
| `file` | `File` | PDF file (max 15MB) |
| `engine` | `string` | `"gemini"` |
| `apiKey` | `string` | Gemini API key |
| `model` | `string` | e.g. `"gemini-2.0-flash"` |

**Response:**
```json
{
  "summary": "# Markdown formatted summary...",
  "flashcards": [
    { "front": "Term", "back": "Definition" }
  ],
  "quiz": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "answer": "Correct option",
      "explanation": "Why this is correct..."
    }
  ]
}
```

---

### `POST /api/text-generate`
Generate study material from plain text input.

```json
{
  "text": "Your study notes here...",
  "engine": "gemini",
  "apiKey": "your_key",
  "model": "gemini-2.0-flash"
}
```

---

### `POST /api/chat/ask`
Ask the AI Tutor a question about your study material.

```json
{
  "message": "What is photosynthesis?",
  "history": [],
  "summary": "Context from the generated summary...",
  "engine": "gemini",
  "apiKey": "your_key",
  "model": "gemini-2.0-flash"
}
```

---

### `POST /api/save-guide` · `GET /api/list-guides` · `GET /api/get-guide/:id`
Supabase CRUD endpoints for saving and retrieving study sessions.

---

## 🎯 GenAI Role in This Project

This project demonstrates **structured output generation** — not just conversational AI:

- The Gemini model receives raw study text and returns a **strict JSON schema** containing `summary`, `flashcards[]`, and `quiz[]`
- The backend validates required keys and sanitizes the JSON output
- **Gemini Vision API** is used as a fallback OCR engine for scanned/image PDFs
- The AI Tutor uses **system instructions** + conversation history for contextual tutoring

---

## 🧑‍💻 Authors & Credits

<table>
  <tr>
    <td align="center">
      <a href="https://www.linkedin.com/in/sandipansarkar007" target="_blank">
        <img src="https://img.shields.io/badge/Sandipan%20Sarkar-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="Sandipan Sarkar LinkedIn" />
      </a>
      <br />
      <strong>Sandipan Sarkar</strong>
      <br />
      <em>Full Stack Developer & AI Integration</em>
    </td>
    <td align="center">
      <a href="https://www.linkedin.com/in/sayanidas17" target="_blank">
        <img src="https://img.shields.io/badge/Sayani%20Das-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="Sayani Das LinkedIn" />
      </a>
      <br />
      <strong>Sayani Das</strong>
      <br />
      <em>UI/UX Design & Frontend Development</em>
    </td>
  </tr>
</table>

> 🎓 This project was developed as a **BCT (Bachelor of Computer Technology) Final Year Project**.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Google Gemini API](https://ai.google.dev/) — AI generation engine
- [Supabase](https://supabase.com/) — Open source database backend
- [Vercel](https://vercel.com/) — Seamless deployment platform
- [PyMuPDF](https://pymupdf.readthedocs.io/) — Fast PDF text extraction
- [Lucide React](https://lucide.dev/) — Beautiful icon library
- [Space Grotesk Font](https://fonts.google.com/specimen/Space+Grotesk) — Premium typography

---

<div align="center">

Made with ❤️ by [Sandipan Sarkar](https://www.linkedin.com/in/sandipansarkar007) & [Sayani Das](https://www.linkedin.com/in/sayanidas17)

⭐ **Star this repo if you find it useful!**

</div>
