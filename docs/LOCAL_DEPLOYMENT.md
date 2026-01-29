# CareerPath AI - Local Deployment Guide

## 🚀 Quick Start (No AWS Required)

CareerPath AI runs fully locally without any AWS account or deployment!

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation & Run

```bash
# 1. Navigate to frontend directory
cd career-path-ai/frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
open http://localhost:3000
```

That's it! 🎉

---

## 📱 What You'll See

### 1. Landing Page (http://localhost:3000)
- Hero section with value proposition
- Feature cards
- Resume upload component

### 2. Chat Page (http://localhost:3000/chat)
- AI career mentor conversation
- Personalized responses based on your profile
- Source citations for recommendations

### 3. Dashboard (http://localhost:3000/dashboard)
- Skill gap radar chart
- 12-week career roadmap
- Job match recommendations
- Certification suggestions

---

## 🧪 Demo Scenarios

### Scenario 1: Resume Upload
1. Go to the landing page
2. Drag and drop any resume (PDF, DOCX, or TXT)
3. Watch the AI analyze and extract skills
4. See your parsed profile

### Scenario 2: Career Guidance Chat
1. Go to `/chat`
2. Try these prompts:
   - "Create a career roadmap for me"
   - "What skills should I learn?"
   - "What jobs match my profile?"
   - "Help me prepare for interviews"

### Scenario 3: Dashboard Exploration
1. Go to `/dashboard`
2. Use the target role dropdown to compare skill gaps
3. Expand weeks in the roadmap timeline
4. Check recommended certifications

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Landing page
│   │   ├── chat/page.tsx     # Chat interface
│   │   ├── dashboard/page.tsx # Dashboard
│   │   └── api/
│   │       ├── chat/route.ts       # AI chat (local)
│   │       └── parse-resume/route.ts # Resume parser (local)
│   ├── components/
│   │   ├── ResumeUpload.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── SkillGapChart.tsx
│   │   └── RoadmapTimeline.tsx
│   └── lib/
│       ├── config.ts        # Configuration
│       └── types.ts         # TypeScript types
└── package.json
```

---

## 🔧 Configuration

The app runs in **local mode** by default. No `.env` file needed!

If you ever want to connect to AWS later, create `.env.local`:

```env
# Only needed if deploying to AWS
NEXT_PUBLIC_API_ENDPOINT=https://your-api.execute-api.us-east-1.amazonaws.com/v1
NEXT_PUBLIC_USER_POOL_ID=us-east-1_xxxxx
NEXT_PUBLIC_ENABLE_AUTH=true
```

---

## 🛠️ Development Commands

```bash
# Start dev server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

---

## 📊 Local Mode Features

| Feature | Status | Notes |
|---------|--------|-------|
| Resume Upload | ✅ Works | Parses locally, no S3 |
| Skill Extraction | ✅ Works | Pattern matching |
| Chat AI | ✅ Works | Intelligent responses |
| Skill Gap Chart | ✅ Works | Demo data |
| Roadmap Timeline | ✅ Works | Demo 12-week plan |
| Authentication | ⏸️ Disabled | Not needed locally |
| Analytics | ⏸️ Disabled | Not needed locally |

---

## ❓ Troubleshooting

### Port 3000 already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Module not found errors
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
# Check TypeScript errors
npm run lint
```

---

## 📧 Support

For issues, check:
1. Node.js version is 18+
2. All dependencies installed
3. No port conflicts

Enjoy your local CareerPath AI! 🎯
