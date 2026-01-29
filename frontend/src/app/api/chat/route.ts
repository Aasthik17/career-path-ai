import { NextResponse } from 'next/server';

/**
 * Chat API - Local Mode
 * Simulates the Agent Orchestrator Lambda for local development
 * Provides intelligent career guidance responses based on context
 */

interface UserProfile {
    personal_info?: { name?: string };
    skills?: { technical?: string[]; soft?: string[] };
    career_level?: string;
    primary_domain?: string;
    total_experience_years?: number;
    certifications?: Array<{ name: string }>;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, user_profile, conversation_history } = body;

        if (!message) {
            return NextResponse.json(
                { error: 'Missing message' },
                { status: 400 }
            );
        }

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate intelligent response based on intent
        const response = generateSmartResponse(message, user_profile, conversation_history);

        return NextResponse.json({
            ...response,
            mode: 'local'
        });
    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json(
            { error: 'Chat failed' },
            { status: 500 }
        );
    }
}

function generateSmartResponse(
    message: string,
    profile?: UserProfile,
    history?: ChatMessage[]
) {
    const inputLower = message.toLowerCase();
    const skills = profile?.skills?.technical || ['Python', 'JavaScript'];
    const name = profile?.personal_info?.name || 'there';
    const careerLevel = profile?.career_level || 'Mid';
    const domain = profile?.primary_domain || 'Software Engineering';
    const experience = profile?.total_experience_years || 3;

    // Intent detection and response generation

    // 1. Career Roadmap Request
    if (inputLower.includes('roadmap') || inputLower.includes('plan') || inputLower.includes('path')) {
        return {
            response: `## 🗺️ Your Personalized 12-Week Career Roadmap

Hey ${name}! Based on your profile as a **${careerLevel} ${domain}** professional with ${experience} years of experience, here's your customized growth plan:

### 📊 Current Assessment
- **Career Level:** ${careerLevel}
- **Primary Skills:** ${skills.slice(0, 4).join(', ')}
- **Experience:** ${experience} years

---

### 🎯 Weeks 1-4: Foundation Strengthening

**Week 1-2: System Design Mastery**
- Complete "Grokking System Design" course
- Design a URL shortener system end-to-end
- Practice explaining designs (15 min daily)

**Week 3-4: Cloud Deep Dive**
- ${skills.includes('AWS') ? 'Advance to AWS Solutions Architect Pro' : 'Start AWS Solutions Architect Associate'}
- Build a serverless application
- Set up monitoring with CloudWatch

---

### 🚀 Weeks 5-8: Skill Expansion

**Week 5-6: DevOps & Infrastructure**
- Master Kubernetes fundamentals
- Set up CI/CD with GitHub Actions
- Deploy with Infrastructure as Code

**Week 7-8: Leadership Skills**
- Lead a technical design review
- Mentor a junior team member
- Write 2 technical blog posts

---

### 🏆 Weeks 9-12: Portfolio & Job Prep

**Week 9-10: Portfolio Project**
- Build a full-stack project showcasing new skills
- Include system design, cloud deployment, monitoring

**Week 11-12: Interview Prep**
- Mock interviews (system design + coding)
- Update resume with new achievements
- Apply to target companies

---

Would you like me to dive deeper into any specific week?`,
            type: 'text',
            sources: [
                { content: 'Career progression data for ' + domain, source: 'skills_taxonomy.json' },
                { content: 'Learning resources and certifications', source: 'learning_resources.json' }
            ]
        };
    }

    // 2. Job Matching Request
    if (inputLower.includes('job') || inputLower.includes('match') || inputLower.includes('opportunit')) {
        const matchScore1 = Math.min(95, 75 + skills.length * 2);
        const matchScore2 = matchScore1 - 8;
        const matchScore3 = matchScore2 - 10;

        return {
            response: `## 🎯 Top Job Matches for Your Profile

Based on your skills in **${skills.slice(0, 3).join(', ')}** and ${experience} years of experience, here are your best matches:

---

### 1. Senior ${domain === 'Full Stack Development' ? 'Full Stack' : 'Software'} Engineer at TechCorp
**Match Score:** ${matchScore1}% ⭐

**Why you're a fit:**
- ✅ ${skills[0]} expertise required
- ✅ ${skills[1] || 'Backend'} skills match
- ✅ Your experience level is ideal

**Compensation:** $150,000 - $200,000 + equity  
**Location:** Remote / San Francisco

---

### 2. Staff Engineer at StartupXYZ
**Match Score:** ${matchScore2}%

**Why you're a fit:**
- ✅ Technical depth in ${skills[0]}
- ✅ ${careerLevel} experience level
- ⚠️ May need more system design experience

**Compensation:** $180,000 - $240,000 + equity  
**Location:** Remote-first

---

### 3. ${domain.includes('ML') ? 'ML' : 'Platform'} Engineer at BigTech Inc
**Match Score:** ${matchScore3}%

**Why you're a fit:**
- ✅ Strong ${skills[0]} background
- ⚠️ ${skills.includes('Kubernetes') ? 'Good K8s knowledge' : 'Would benefit from K8s experience'}
- ⚠️ Larger company may want more experience

**Compensation:** $160,000 - $220,000  
**Location:** Hybrid

---

### 📈 How to Improve Your Match Scores

1. **Add Kubernetes** to your skillset (+5-10% match)
2. **Get AWS certification** (+3-5% match)
3. **Build system design portfolio** (+5-8% match)

Would you like tips on preparing for any of these specific roles?`,
            type: 'text',
            sources: [
                { content: 'Current job market data', source: 'job_postings.json' },
                { content: 'Salary benchmarks', source: 'skills_taxonomy.json' }
            ]
        };
    }

    // 3. Skill Analysis Request
    if (inputLower.includes('skill') || inputLower.includes('learn') || inputLower.includes('gap')) {
        return {
            response: `## 📚 Skill Gap Analysis for ${name}

### ✅ Your Current Strengths
${skills.map(s => `- **${s}** - Market demand: High`).join('\n')}

---

### 🎯 High-Priority Skills to Learn

Based on your goal of advancing to **Senior/Staff ${domain}**, here are the key skills to focus on:

| Skill | Priority | Salary Premium | Time to Learn |
|-------|----------|---------------|---------------|
| System Design | 🔴 Critical | +15-25% | 3-6 months |
| Kubernetes | 🟠 High | +20% | 2-3 months |
| ${skills.includes('AWS') ? 'AWS Advanced' : 'AWS Fundamentals'} | 🟠 High | +12% | 2-4 months |
| Leadership | 🟡 Medium | +10-20% | Ongoing |

---

### 📖 Recommended Learning Path

**1. System Design (Start Here)**
- 📚 "Designing Data-Intensive Applications" book
- 🎓 Educative.io System Design course ($79)
- ⏱️ 8-10 hours/week for 2 months

**2. Kubernetes**
- 🎓 CKA Certification prep ($395)
- 💻 Hands-on with Minikube
- ⏱️ 5-8 hours/week for 6 weeks

**3. AWS Advanced**
- 🎓 AWS Solutions Architect Professional
- 💻 Build 3 production projects
- ⏱️ 10 hours/week for 2 months

---

### 📊 Your Skill Score

\`\`\`
Current:   ████████░░░░ 68%
Target:    ████████████ 100%
Gap:       ████░░░░░░░░ 32%
\`\`\`

Would you like specific resources for any of these skills?`,
            type: 'text',
            sources: [
                { content: 'Skills demand and salary data', source: 'skills_taxonomy.json' },
                { content: 'Learning resources and courses', source: 'learning_resources.json' }
            ]
        };
    }

    // 4. Certification Request
    if (inputLower.includes('certif') || inputLower.includes('credential')) {
        const hasCerts = profile?.certifications && profile.certifications.length > 0;

        return {
            response: `## 🏆 Certification Recommendations

${hasCerts ? `**Your Current Certifications:** ${profile?.certifications?.map(c => c.name).join(', ')}\n\n---` : ''}

### Top Certifications for ${domain}

**1. AWS Solutions Architect - Professional** 🌟
- **Value:** Highly recognized, 15% salary boost
- **Difficulty:** ⭐⭐⭐⭐ (Hard)
- **Time:** 80-120 hours study
- **Cost:** $300 exam

**2. Certified Kubernetes Administrator (CKA)** 🌟
- **Value:** Hot skill, 20% salary premium for K8s roles
- **Difficulty:** ⭐⭐⭐⭐ (Hard)
- **Time:** 40-60 hours study
- **Cost:** $395 exam

**3. Google Cloud Professional Cloud Architect**
- **Value:** Growing demand, multi-cloud advantage
- **Difficulty:** ⭐⭐⭐ (Medium)
- **Time:** 60-80 hours study
- **Cost:** $200 exam

---

### 📅 Recommended Certification Order

1. **Month 1-2:** AWS Solutions Architect Associate (if not done)
2. **Month 3-4:** CKA or AWS Professional
3. **Month 5-6:** Specialty cert based on role

Would you like a detailed study plan for any certification?`,
            type: 'text',
            sources: [
                { content: 'Certification value data', source: 'learning_resources.json' }
            ]
        };
    }

    // 5. Resume/Profile Question
    if (inputLower.includes('resume') || inputLower.includes('profile') || inputLower.includes('improve')) {
        return {
            response: `## 📝 Profile Enhancement Tips

Based on your current profile, here are specific improvements:

### 1. Technical Skills Section
**Current:** ${skills.length} skills listed
**Recommendation:** Group by category
\`\`\`
Languages: Python, JavaScript, TypeScript
Frameworks: React, Node.js, Django
Cloud: AWS (EC2, S3, Lambda)
DevOps: Docker, Kubernetes, CI/CD
\`\`\`

### 2. Experience Bullets
**Use the STAR format:**
- ❌ "Worked on backend services"
- ✅ "Architected microservices handling 10K RPS, reducing latency by 40%"

### 3. Add Metrics Everywhere
- Lines of code → Users impacted
- "Built features" → "Launched 3 features to 1M+ users"
- "Improved performance" → "Reduced load time by 60%"

### 4. Missing Sections to Add
- [ ] Technical blog or portfolio link
- [ ] Open source contributions
- [ ] Speaking engagements/leadership

Would you like me to help you rewrite any specific section?`,
            type: 'text',
            sources: []
        };
    }

    // 6. Interview Prep
    if (inputLower.includes('interview') || inputLower.includes('prepare')) {
        return {
            response: `## 🎤 Interview Preparation Guide

### For ${careerLevel} ${domain} Roles

---

### 📋 Interview Types to Expect

| Round | Duration | Focus |
|-------|----------|-------|
| Phone Screen | 30 min | Background, motivation |
| Technical Screen | 60 min | Coding (LeetCode Medium) |
| System Design | 45-60 min | Architecture, trade-offs |
| Behavioral | 45 min | Leadership, conflict |
| Team Fit | 30 min | Culture, questions |

---

### 🧠 System Design Prep (Most Important for Senior+)

**Topics to Master:**
1. Load balancers & CDNs
2. Database scaling (sharding, replication)
3. Caching strategies (Redis, CDN)
4. Message queues (Kafka, SQS)
5. Microservices patterns

**Practice Problems:**
- Design Twitter/Instagram feed
- Design a URL shortener
- Design a rate limiter
- Design a chat system

---

### 💻 Coding Prep

**Focus Areas:**
- Arrays & Strings (30% of questions)
- Trees & Graphs (25%)
- Dynamic Programming (20%)
- System manipulation (15%)

**Daily Practice:**
- 1-2 LeetCode Medium problems
- Review solutions after each attempt
- Track patterns, not just solutions

---

### 🗣️ Behavioral Prep (STAR Method)

Prepare stories for:
1. Technical leadership example
2. Conflict resolution
3. Failure and learning
4. Mentoring experience
5. Biggest technical achievement

Would you like mock interview questions for any area?`,
            type: 'text',
            sources: []
        };
    }

    // Default: General greeting and guidance
    return {
        response: `## 👋 Hi ${name}! I'm your Career AI Mentor

Great to see you! Based on your profile, here's what I know about you:

**📊 Quick Profile Summary**
- **Level:** ${careerLevel} ${domain}
- **Experience:** ${experience} years
- **Top Skills:** ${skills.slice(0, 5).join(', ')}

---

### 🎯 Here's What I Can Help You With

1. **🗺️ Career Roadmap** - Get a personalized 12-week growth plan
2. **🎯 Job Matching** - Find roles that match your skills
3. **📚 Skill Analysis** - Identify gaps and learning priorities
4. **🏆 Certifications** - Recommendations for career advancement
5. **🎤 Interview Prep** - Practice and strategies

---

### 💡 Try Asking Me:

> "What skills should I learn next?"

> "Create a career roadmap for me"

> "What jobs match my profile?"

> "Help me prepare for interviews"

What would you like to explore first?`,
        type: 'text',
        sources: []
    };
}
