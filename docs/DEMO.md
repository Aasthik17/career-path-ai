# CareerPath AI - Demo Script

## 🎬 Demo Walkthrough

This document provides a step-by-step demonstration of CareerPath AI's capabilities.

---

## Scenario: Sarah's Career Journey

**User Profile:**
- Name: Sarah Chen
- Current Role: Mid-level Software Engineer (3 years)
- Goal: Transition to Senior/Staff Engineer at a top tech company

---

## Demo Steps

### Step 1: Landing Page

1. Open CareerPath AI at `http://localhost:3000`
2. Observe the hero section with key value propositions
3. Note the "Powered by Amazon Bedrock" badge

**Key Points to Highlight:**
- Modern, professional UI design
- Clear call-to-actions
- Feature overview cards

---

### Step 2: Resume Upload

1. Scroll to the upload section
2. Drag and drop Sarah's resume (or click to upload)
3. Watch the animated parsing progress

**Input:**
```
Sarah Chen
Software Engineer | San Francisco, CA
sarah.chen@email.com

SUMMARY
Software engineer with 3 years of experience building web applications.
Passionate about clean code and scalable systems.

SKILLS
Python, JavaScript, React, Node.js, PostgreSQL, Docker, Git

EXPERIENCE
Software Engineer | TechStartup Inc. | 2021-Present
- Developed RESTful APIs serving 500K+ daily requests
- Implemented CI/CD pipelines reducing deployment time by 60%
- Collaborated with product team on user-facing features

Junior Developer | WebAgency | 2020-2021
- Built responsive websites for 10+ clients
- Learned React and modern frontend practices

EDUCATION
B.S. Computer Science | UC Berkeley | 2020

CERTIFICATIONS
AWS Cloud Practitioner | 2023
```

**Expected Output:**
- Profile card showing extracted information
- Skills tags displayed
- Career level identified as "Mid"
- Ready to proceed to chat

---

### Step 3: Chat with AI Mentor

1. Navigate to `/chat` or click "Chat with AI Mentor"
2. See the welcome message with suggested prompts

**Conversation 1: Job Matching**

User: "What jobs match my skills?"

**Expected Response:**
```markdown
## 🎯 Jobs Matching Your Profile

Based on your skills in Python, JavaScript, React...

### 1. Senior Software Engineer at TechCorp
**Match Score:** 85%
- ✅ Python, React, Node.js
- 💰 $150k - $200k
...
```

**Conversation 2: Skill Gap Analysis**

User: "What skills should I learn next?"

**Expected Response:**
```markdown
## 📚 Skills Analysis & Recommendations

### ✅ Your Valuable Skills
- Python
- JavaScript
- React
...

### 🎯 High-Priority Skills to Learn
1. **Kubernetes** - 25% salary premium
2. **System Design** - Critical for senior roles
...
```

**Conversation 3: Career Roadmap**

User: "Create a 12-week career roadmap"

**Expected Response:**
Complete 12-week plan with:
- Weekly focus areas
- Specific tasks
- Learning resources
- Milestones

---

### Step 4: Dashboard View

1. Navigate to `/dashboard`
2. Explore the interactive visualizations

**Key Visualizations:**

**Skill Gap Radar Chart:**
- Current skills vs. required for "Senior Software Engineer"
- Visual gap identification
- Priority skills highlighted

**12-Week Roadmap Timeline:**
- Expandable week cards
- Task checklists
- Resource links
- Progress tracking

**Stats Grid:**
- Career Readiness: 72%
- Skills Matched: 8/12
- Certifications: 1
- Experience: 3 years

---

### Step 5: Explainability Demo

1. In chat, ask: "Why did you recommend Kubernetes?"
2. Show source citations in response

**Key Points:**
- Quotes from job postings data
- Links to source documents
- Reasoning steps explained

---

## 🔧 Technical Demo (Optional)

### Show AWS Resources

1. **S3 Console**: Show resume and source data buckets
2. **Lambda Console**: Show function executions
3. **CloudWatch**: Show metrics dashboard
4. **Bedrock**: Show Knowledge Base configuration

### Show Code Quality

1. **CDK Stack**: Infrastructure as code
2. **Lambda Handlers**: Clean Python with prompts
3. **Frontend Components**: Modular React
4. **Test Coverage**: Unit and integration tests

---

## ✅ Hackathon Compliance Checklist

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Region: us-east-1 | ✅ | CDK stack config |
| Service role: hackathon-bedrock-kb-role | ✅ | IAM reference in CDK |
| Amazon Titan Embed v2 | ✅ | Lambda env vars |
| Amazon Nova Pro v1 | ✅ | Lambda env vars |
| No third-party models | ✅ | Code review |

---

## 📊 KPIs Demonstrated

1. **Role Alignment Accuracy**: Job match scores shown
2. **Career Readiness Score**: Dashboard percentage
3. **Skill Gap Analysis**: Radar chart visualization
4. **Explainability**: Source citations in responses
5. **Low Latency**: Sub-15 second responses

---

## 🎤 Demo Talking Points

1. "CareerPath AI analyzes resumes using Amazon Bedrock's Nova Pro model"
2. "Our RAG pipeline retrieves relevant career data from the Knowledge Base"
3. "Every recommendation includes source citations for transparency"
4. "The 12-week roadmap is personalized based on your specific skill gaps"
5. "All infrastructure is defined in code using AWS CDK"

---

## 🚨 Troubleshooting

**If demo fails:**
1. Frontend works in demo mode without backend
2. Chat provides contextual mock responses
3. Dashboard shows sample data

**Backup:**
- Screenshots of working system
- Pre-recorded video walkthrough
