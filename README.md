# 🧠 StudyGenius AI — Smart Study Notes Generator

<div align="center">

![StudyGenius AI Banner](https://img.shields.io/badge/StudyGenius%20AI-Smart%20Study%20Notes-6366f1?style=for-the-badge&logo=sparkles&logoColor=white)
![Powered by Groq](https://img.shields.io/badge/Powered%20by-Groq%20(Llama%203.3)-f55036?style=for-the-badge&logo=groq&logoColor=white)
![React](https://img.shields.io/badge/React%2018-Frontend-61dafb?style=for-the-badge&logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-Backend-ec4899?style=for-the-badge&logo=flask&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database%20&%20Auth-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**Transform your PDFs and lecture notes into AI-powered summaries, interactive 3D flashcards, and gamified quizzes — instantly.**

[🚀 Live Demo](#) · [📖 Documentation](#documentation) · [🐛 Report Bug](https://github.com/Sandipan003/smart-study-notes-ai/issues) · [💡 Request Feature](https://github.com/Sandipan003/smart-study-notes-ai/issues)

</div>

---

## 📸 Preview

| Hero Landing | Unified Workspace | 3D Flashcards |
|:---:|:---:|:---:|
| Animated 3D Knowledge Core & Auth | Continuous study space with side AI Tutor | Real 3D flip cards with swipe gestures |

---

## ✨ Features

### 🤖 AI-Powered Generation (Powered by Groq & Llama 3)
- **Lightning Fast** — Uses Groq LPUs for near-instant response times to resolve traditional AI rate limits.
- **Smart Summary** — Extracts and structures key concepts, formulas, and definitions into clean markdown.
- **Interactive Flashcards** — AI generates high-quality concept/explanation card pairs.
- **Multiple-Choice Quiz** — AI creates MCQ questions with detailed explanations per answer.

### 🎨 3D Modern UI
- **React Three Fiber** interactive Knowledge Core on the landing page.
- **Glassmorphism 2.0** with deep space dark theme and neon accents.
- **Real 3D flashcard flip** with depth and spatial animations powered by Framer Motion.
- **Unified Workspace** — Seamless layout containing notes, flashcards, quiz, and AI Tutor without page refreshes.
- **Tailwind CSS v4** — Ultra-fast styling engine for fluid layouts.

### 🔐 Supabase Authentication & RLS
- **User Accounts** — Dedicated sign up and sign in flow with email verification.
- **Row-Level Security (RLS)** — Complete data privacy so you only see your own study guides and chat history.
- **Library & Sync** — Auto-saves generated study guides to your personal Supabase library for future reviewing.

### 🧑‍🏫 AI Tutor Chat
- Context-aware chatbot pinned to your workspace, grounded in your uploaded notes.
- Instant explanations for difficult concepts using Groq's high-speed Llama 3 API.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite 5, Tailwind CSS v4, Framer Motion |
| **3D Rendering** | Three.js, React Three Fiber, Drei |
| **Backend** | Python, Flask, Flask-CORS |
| **AI Engine** | Groq API (Llama-3.3-70b-versatile) |
| **PDF Extraction** | PyMuPDF (fitz), pypdf |
| **Database & Auth** | Supabase (PostgreSQL via REST API & Auth API) |
| **Deployment** | Vercel (frontend + backend) |
| **Icons & Fonts** | Lucide React, Google Fonts (Space Grotesk, Inter) |

---

## 🏗️ Project Structure

```
smart-study-notes-ai/
│
├── 📁 src/                          # React frontend
│   ├── 📁 components/
│   │   ├── 📁 landing/              # LandingPage, AuthView
│   │   ├── 📁 study/                # UnifiedWorkspace, TutorPanel
│   │   ├── 📁 three/                # KnowledgeCore3D (React Three Fiber)
│   │   ├── UploadArea.jsx           # File upload component
│   │   ├── SummaryView.jsx          # Markdown summary interface
│   │   ├── FlashcardsView.jsx       # 3D flip card deck
│   │   └── QuizView.jsx             # MCQ quiz with results
│   ├── App.jsx                      # Main app shell, routing, auth state
│   ├── index.css                    # Tailwind v4 theme and styling
│   └── main.jsx                     # React entry point
│
├── 📁 backend/
│   ├── app.py                       # Flask API routes
│   ├── requirements.txt             # Python dependencies
│   ├── vercel.json                  # Backend Vercel deployment config
│   └── .env                         # API keys (not committed)
│
├── index.html                       # Entry HTML
├── vite.config.js                   # Vite configuration
└── package.json                     # Frontend dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ 
- **Python** 3.9+
- **Groq API Key** — [Get one free here](https://console.groq.com/keys)
- **Supabase Project** — [supabase.com](https://supabase.com)

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

# Activate it (Windows)
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
# → Runs at http://localhost:5001
```

---

### 4️⃣ Configuration

Create `backend/.env` with these values:

```env
# Groq API Key (required for generation & AI Tutor)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Supabase (required for Auth and History sync)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
```

---

### 5️⃣ Supabase Database Setup

Run this SQL in your Supabase SQL Editor to configure the tables, user relationships, and Row-Level Security (RLS):

```sql
-- Study guides table
CREATE TABLE study_guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  flashcards JSONB DEFAULT '[]',
  quiz JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat history table
CREATE TABLE chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES study_guides(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE study_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies to isolate data per user
CREATE POLICY "Allow users to read their own study guides" ON study_guides
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own study guides" ON study_guides
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own study guides" ON study_guides
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own study guides" ON study_guides
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to access their own chat history" ON chat_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM study_guides 
      WHERE study_guides.id = chat_history.guide_id 
      AND study_guides.user_id = auth.uid()
    )
  );
```

---

## 🌐 Deployment on Vercel

1. Import the repository at [vercel.com/new](https://vercel.com/new)
2. Vercel automatically detects the single-repo configuration (frontend Vite app + backend serverless functions via `vercel.json` routing).
3. Add the following Environment Variables in Vercel Settings:
   - `GROQ_API_KEY` = your Groq API key
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - `SUPABASE_URL` = your Supabase URL (backend)
   - `SUPABASE_KEY` = your Supabase anon key (backend)
4. Deploy!

---

## 🎯 GenAI Role in This Project

This project demonstrates **structured output generation** via Llama 3 models:

- The Groq API receives raw text extraction from PDFs and returns a **strict JSON schema** containing `summary`, `flashcards[]`, and `quiz[]`.
- The backend validates required keys and routes the output securely to the Supabase authenticated session.
- The AI Tutor uses system instructions and contextual memory to help users master their uploaded concepts without hallucinating unrelated topics.

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


---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [Sandipan Sarkar](https://www.linkedin.com/in/sandipansarkar007) & [Sayani Das](https://www.linkedin.com/in/sayanidas17)

⭐ **Star this repo if you find it useful!**

</div>
