# CareerPath AI - Architecture Documentation

## System Overview

CareerPath AI is a serverless, AI-powered career mentoring platform built on AWS using Amazon Bedrock's foundation models.

## Data Flow Diagram

```
                                    CareerPath AI - Data Flow
    
    ┌─────────────┐
    │    User     │
    └──────┬──────┘
           │ 1. Upload Resume
           ▼
    ┌─────────────┐      2. Auth        ┌──────────────┐
    │   Next.js   │─────────────────────│   Cognito    │
    │  Frontend   │                     │  User Pool   │
    └──────┬──────┘                     └──────────────┘
           │ 3. API Request
           ▼
    ┌─────────────┐
    │ API Gateway │ ◄──── CORS + Auth
    └──────┬──────┘
           │ 4. Route to Lambda
           ▼
    ┌─────────────────────────────────────────────────────┐
    │                   AWS Lambda                         │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
    │  │   Resume    │  │ Embedding   │  │    RAG      │  │
    │  │   Parser    │  │  Pipeline   │  │  Retriever  │  │
    │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │
    │         │                │                │         │
    │         └────────────────┴────────────────┘         │
    │                          │                          │
    │                    ┌─────┴─────┐                    │
    │                    │   Agent   │                    │
    │                    │Orchestrator│                    │
    │                    └─────┬─────┘                    │
    └──────────────────────────┼──────────────────────────┘
                               │ 5. AI Requests
                               ▼
    ┌──────────────────────────────────────────────────────┐
    │                    Amazon Bedrock                     │
    │                                                       │
    │  ┌──────────────────┐    ┌────────────────────────┐  │
    │  │  Knowledge Base  │    │    Foundation Models   │  │
    │  │                  │    │                        │  │
    │  │  ┌────────────┐  │    │  ┌──────────────────┐  │  │
    │  │  │ Titan Embed│  │    │  │   Nova Pro v1    │  │  │
    │  │  │    v2      │  │    │  │   (Generation)   │  │  │
    │  │  └────────────┘  │    │  └──────────────────┘  │  │
    │  └────────┬─────────┘    └────────────────────────┘  │
    │           │                                          │
    └───────────┼──────────────────────────────────────────┘
                │ 6. Vector Search
                ▼
    ┌───────────────────┐
    │        S3         │
    │  ┌─────────────┐  │
    │  │   Resumes   │  │
    │  └─────────────┘  │
    │  ┌─────────────┐  │
    │  │ Source Data │  │
    │  │ (Jobs,Skills│  │
    │  │  Resources) │  │
    │  └─────────────┘  │
    └───────────────────┘
```

## Component Details

### Frontend (Next.js 14)

| Component | Purpose |
|-----------|---------|
| `ResumeUpload` | Drag-drop file upload with S3 presigned URLs |
| `ChatInterface` | Real-time chat with markdown rendering |
| `SkillGapChart` | Radar chart visualization (Recharts) |
| `RoadmapTimeline` | Expandable 12-week plan view |

### Backend (AWS Lambda - Python)

| Function | Purpose | Timeout |
|----------|---------|---------|
| `resume-parser` | Extract skills, roles, experience | 60s |
| `embedding-pipeline` | Create profile embeddings | 120s |
| `rag-retriever` | Search Knowledge Base | 60s |
| `agent-orchestrator` | Coordinate pipeline, generate responses | 300s |

### AI Models

| Model | Use Case | Region |
|-------|----------|--------|
| `amazon.titan-embed-text-v2:0` | Profile embeddings | us-east-1 |
| `amazon.nova-pro-v1:0` | Resume parsing, roadmap generation | us-east-1 |

### Storage

| Bucket | Contents |
|--------|----------|
| `careerpath-resumes-{account}` | User uploaded resumes |
| `careerpath-sourcedata-{account}` | KB source: jobs, skills, resources |

## RAG Pipeline

```
1. User Query → Intent Analysis
        ↓
2. Format Retrieval Query
        ↓
3. Bedrock KB Hybrid Search
        ↓
4. Retrieve Top-K Documents
        ↓
5. Construct Context Window
        ↓
6. Generate Response (Nova Pro)
        ↓
7. Add Source Citations
        ↓
8. Return to User
```

## Security Architecture

- **Authentication**: Amazon Cognito
- **Authorization**: IAM roles with least privilege
- **Encryption**: S3 SSE, HTTPS only
- **Network**: API Gateway with CORS, throttling

## Monitoring

- CloudWatch Logs for all Lambda functions
- Custom dashboard: `CareerPathAI-Metrics`
- Metrics: invocations, errors, duration, API requests
